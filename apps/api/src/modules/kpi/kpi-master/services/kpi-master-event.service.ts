/**
 * KPI Master Event Service
 *
 * @module kpi/kpi-master
 *
 * Business Rules:
 * - イベントはDRAFT状態で作成される
 * - event_code は company 内で一意
 * - DRAFT → CONFIRMED への状態遷移のみ許可
 * - CONFIRMED 状態からの変更は不可
 * - 作成・更新時に監査ログを記録
 *
 * Spec: .kiro/specs/kpi/kpi-master/design.md (Service Specification)
 */
import { Injectable } from '@nestjs/common';
import { KpiMasterEventRepository } from '../repositories/kpi-master-event.repository';
import type {
  KpiMasterEventApiDto,
  CreateKpiMasterEventApiDto,
  UpdateKpiMasterEventApiDto,
  GetKpiMasterEventsApiQueryDto,
} from '@epm/contracts/api/kpi-master';
import {
  KpiMasterEventNotFoundError,
  KpiMasterEventAlreadyConfirmedError,
  KpiMasterEventDuplicateError,
} from '@epm/contracts/shared/errors';

@Injectable()
export class KpiMasterEventService {
  constructor(
    private readonly kpiMasterEventRepository: KpiMasterEventRepository,
  ) {}

  /**
   * KPI管理イベント一覧取得
   */
  async findAllEvents(
    tenantId: string,
    query: Omit<GetKpiMasterEventsApiQueryDto, 'tenant_id'>,
  ): Promise<{ items: KpiMasterEventApiDto[]; total: number }> {
    return this.kpiMasterEventRepository.findAll(tenantId, query);
  }

  /**
   * KPI管理イベント詳細取得
   */
  async findEventById(
    tenantId: string,
    id: string,
  ): Promise<KpiMasterEventApiDto> {
    const event = await this.kpiMasterEventRepository.findById(tenantId, id);

    if (!event) {
      throw new KpiMasterEventNotFoundError(`KPI Master Event not found: ${id}`);
    }

    return event;
  }

  /**
   * KPI管理イベント作成
   *
   * ビジネスルール:
   * - event_code 重複チェック（company 内）
   * - DRAFT 状態で作成
   */
  async createEvent(
    tenantId: string,
    userId: string,
    data: Omit<CreateKpiMasterEventApiDto, 'tenant_id' | 'created_by'> & {
      company_id: string;
    },
  ): Promise<KpiMasterEventApiDto> {
    // event_code 重複チェック
    const existingEvent = await this.kpiMasterEventRepository.findByEventCode(
      tenantId,
      data.company_id,
      data.event_code,
    );

    if (existingEvent) {
      throw new KpiMasterEventDuplicateError(
        `Event code already exists: ${data.event_code}`,
      );
    }

    // イベント作成（DRAFT状態）
    const event = await this.kpiMasterEventRepository.create(tenantId, {
      tenant_id: tenantId,
      company_id: data.company_id,
      event_code: data.event_code,
      event_name: data.event_name,
      fiscal_year: data.fiscal_year,
      created_by: userId,
    });

    // TODO: 監査ログ記録
    // auditLog.record('kpi_master_event.create', { eventId: event.id, userId });

    return event;
  }

  /**
   * KPI管理イベント確定
   *
   * ビジネスルール:
   * - DRAFT → CONFIRMED のみ許可
   * - CONFIRMED 状態からの変更は不可
   */
  async confirmEvent(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<KpiMasterEventApiDto> {
    // イベント存在確認
    const event = await this.kpiMasterEventRepository.findById(tenantId, id);

    if (!event) {
      throw new KpiMasterEventNotFoundError(`KPI Master Event not found: ${id}`);
    }

    // CONFIRMED 状態チェック
    if (event.status === 'CONFIRMED') {
      throw new KpiMasterEventAlreadyConfirmedError(
        `Event already confirmed: ${id}`,
      );
    }

    // 状態遷移: DRAFT → CONFIRMED
    const updatedEvent = await this.kpiMasterEventRepository.update(
      tenantId,
      id,
      {
        status: 'CONFIRMED',
        updated_by: userId,
      },
    );

    // TODO: 監査ログ記録
    // auditLog.record('kpi_master_event.confirm', { eventId: id, userId });

    return updatedEvent;
  }

  /**
   * KPI管理イベント更新（名称のみ）
   *
   * ビジネスルール:
   * - event_name のみ更新可能
   * - event_code, fiscal_year, status は別メソッドで管理
   */
  async updateEvent(
    tenantId: string,
    id: string,
    userId: string,
    data: { event_name: string },
  ): Promise<KpiMasterEventApiDto> {
    // イベント存在確認
    const event = await this.kpiMasterEventRepository.findById(tenantId, id);

    if (!event) {
      throw new KpiMasterEventNotFoundError(`KPI Master Event not found: ${id}`);
    }

    // 名称更新
    const updatedEvent = await this.kpiMasterEventRepository.update(
      tenantId,
      id,
      {
        event_name: data.event_name,
        updated_by: userId,
      },
    );

    // TODO: 監査ログ記録
    // auditLog.record('kpi_master_event.update', { eventId: id, userId });

    return updatedEvent;
  }
}
