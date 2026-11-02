import type { Metadata } from "next";
import { DocShell } from "@/components/DocShell";
import { CONTACT_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー | イラスト道案内",
  description: "イラスト道案内のプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <DocShell title="プライバシーポリシー">
      <p className="text-xs opacity-70">最終更新日: 2026年11月2日</p>

      <p>
        「イラスト道案内」（以下「本サービス」）は、利用者のプライバシーを尊重し、取り扱う情報を次のとおり定めます。
      </p>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">1. 収集する情報</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            場所検索のために入力された地名・住所文字列（検索APIへ送信されます）
          </li>
          <li>
            地図範囲の作成に必要な座標情報（OpenStreetMap 系APIへのリクエストに使用）
          </li>
          <li>
            ブラウザの localStorage に保存される途中下書き・お気に入り素材サイトなど（端末内のみ）
          </li>
          <li>
            アクセスログ等、一般的なウェブサーバが自動的に記録する情報（運用環境による）
          </li>
        </ul>
        <p>アカウント登録や、氏名・メールアドレスの必須入力はありません。</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">2. 利用目的</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>道案内マップの作成・表示・書き出し機能の提供</li>
          <li>不具合対応・サービス改善</li>
          <li>不正利用の防止</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">3. 外部サービス</h2>
        <p>
          場所検索・地図データ取得のため、OpenStreetMap / Nominatim
          等の外部サービスを利用します。各サービスのポリシーもご確認ください。広告を掲載する場合は、広告配信事業者のクッキー等が使用されることがあります。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">4. 第三者提供</h2>
        <p>
          法令に基づく場合を除き、収集した情報を本人の同意なく第三者に販売・提供しません。機能提供のために必要な範囲で外部APIへ送信することがあります。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">5. 保存期間</h2>
        <p>
          端末内の下書き等は、利用者が削除するかブラウザの保存領域を消去するまで残ります。サーバ側ログの保存期間は運用方針に従います。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">6. お問い合わせ</h2>
        <p>
          本ポリシーに関するお問い合わせは、
          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF8A65] underline"
          >
            お問い合わせフォーム
          </a>
          までご連絡ください。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">7. 改定</h2>
        <p>
          本ポリシーは必要に応じて改定することがあります。重要な変更がある場合は、本サービス上で告知します。
        </p>
      </section>
    </DocShell>
  );
}
