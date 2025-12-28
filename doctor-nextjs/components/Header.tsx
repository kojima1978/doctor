export default function Header() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <img
        src="/calculator.svg"
        alt="計算機"
        width="80"
        height="80"
      />
      <h1 className="text-3xl font-bold">
        簡単！！ 出資持分の評価額試算ツール
      </h1>
    </div>
  );
}
