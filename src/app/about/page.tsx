import type { Metadata } from "next";
import { DocShell } from "@/components/DocShell";

export const metadata: Metadata = {
  title: "はじめに・遊び方 | イラスト道案内",
  description: "イラスト道案内の使い方と注意事項",
};

export default function AboutPage() {
  return (
    <DocShell title="はじめに・遊び方">
      <p>
        「イラスト道案内」は、OpenStreetMap
        の道・線路・公園・川をベースに、フリー素材や自分の画像で道案内マップを作るツールです。
      </p>
      <p className="rounded-lg border border-[#EDE6DC] bg-[#FFFDF8] px-3 py-2 text-[13px]">
        地図と用紙を並べて編集するツールのため、<strong>パソコンでの利用を推奨</strong>
        します（スマホ向けの本格対応は今後の課題です）。
      </p>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">つくり方（5ステップ）</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>場所</strong>を検索して、地図を目的地付近へ移動します。
          </li>
          <li>
            <strong>範囲を選ぶ</strong>で地図上をドラッグし、載せたいエリアを囲みます。
          </li>
          <li>
            <strong>この範囲でベースを作成</strong>を押すと、右側にイラスト用紙ができます。
          </li>
          <li>
            スタンプや画像を配置し、名前・大きさ・回転・フォントを整えます。スタンプはドラッグで移動できます。
          </li>
          <li>
            PNG / JPEG / SVG / PPTX で書き出します。途中保存もできます。
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">便利な操作</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Ctrl+Z（MacはCmd+Z）または「戻す」でひとつ前に戻ります</li>
          <li>スタンプを選んで Delete / Backspace で削除</li>
          <li>右側の＋−で用紙を拡大・縮小（スクロールで細部を確認）</li>
          <li>フリー素材サイトへのリンクや、キーワード比較パネルも使えます</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">素材について</h2>
        <p>
          各フリー素材サイトの利用規約・クレジット表記は、必ず各サイトの案内に従ってください。本サービスは素材そのものを再配布しません。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#4A4038]">地図データ</h2>
        <p>
          ベース地図は OpenStreetMap のデータを利用しています（© OpenStreetMap
          contributors）。表示用タイルも OSM を使用しています。
        </p>
      </section>
    </DocShell>
  );
}
