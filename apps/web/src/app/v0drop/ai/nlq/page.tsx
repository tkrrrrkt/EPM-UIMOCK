'use client';

/**
 * Next.js App Router page for Natural Language Q&A
 * Route: /_v0_drop/ai/nlq (development only)
 */

import { useState } from 'react';
import { ChatWindow, ChatMessage, QueryInput } from '@v0/ai/_shared';
import { AnswerCard, QuickQuestions, WelcomeMessage } from '@v0/ai/nlq/src/components';
import { useChatSession } from '@v0/ai/nlq/src/hooks/useChatSession';

export default function Page() {
  const [isOpen, setIsOpen] = useState(true);
  const { messages, isLoading, sendQuery } = useChatSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            自然言語Q&A（Natural Language Query）
          </h1>
          <p className="text-muted-foreground">
            経営データを自然な言葉で質問できるチャットUI。
            右下のチャットボタンをクリックして試してみてください。
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-lg">使い方</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>右下のチャットボタンをクリックして開く</li>
            <li>よくある質問から選択するか、自由に質問を入力</li>
            <li>AIが経営データを検索・集計して回答</li>
            <li>メトリクス表示とアクションボタンで詳細確認</li>
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-sm">対応している質問</h3>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• 今期着地は？</li>
              <li>• 今月の実績は？</li>
              <li>• 予算との差異は？</li>
              <li>• 前年同月比は？</li>
              <li>• 9月の営業1部の売上高は？</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-sm">主な機能</h3>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• リアルタイム数値表示</li>
              <li>• 差異・トレンド表示</li>
              <li>• 部門・科目コンテキスト</li>
              <li>• アクションボタン連携</li>
              <li>• セッション管理</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">実装状態: v0_drop (UI-MOCK Phase)</p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• MockBffClient による疑似データ</li>
            <li>• 500ms の遅延シミュレーション</li>
            <li>• shadcn/ui コンポーネント使用</li>
            <li>• EPM デザインシステム準拠</li>
          </ul>
        </div>
      </div>

      <ChatWindow isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center px-4">
            <WelcomeMessage />
            <QuickQuestions onQuestionClick={sendQuery} />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 pb-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message}>
                  {message.type === 'ai' && !message.isLoading && (
                    <AnswerCard
                      data={message.data}
                      actions={message.actions}
                      onActionClick={(action) => console.log('Action:', action)}
                    />
                  )}
                  {message.clarification && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {message.clarification.message}
                      </p>
                      <QuickQuestions onQuestionClick={sendQuery} />
                    </div>
                  )}
                </ChatMessage>
              ))}
            </div>

            <div className="border-t pt-4">
              <QueryInput
                onSubmit={sendQuery}
                disabled={isLoading}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </ChatWindow>
    </div>
  );
}
