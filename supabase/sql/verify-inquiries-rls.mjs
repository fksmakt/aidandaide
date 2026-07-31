// site.inquiries の RLS が意図通り（anonはINSERTのみ可、SELECT不可）か検証する。
// 実行: SUPABASE_URL と SUPABASE_ANON_KEY を環境変数で渡して `node supabase/sql/verify-inquiries-rls.mjs`

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('SUPABASE_URL と SUPABASE_ANON_KEY を環境変数で指定してください');
  process.exit(1);
}

async function main() {
  // 1. INSERTは成功するはず
  // 注意: Prefer は return=minimal を使う。return=representation にすると
  // PostgRESTはRETURNING句でid/created_at（クライアントが指定していないサーバー生成値）を
  // 読み戻そうとし、それにはSELECT権限が必要になる。今回anonにはSELECTを付与していないため、
  // return=representationだと正しい設定でも権限エラーになってしまう。
  const insertRes = await fetch(`${url}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Content-Profile': 'site',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: 'RLS検証テスト',
      email: 'rls-test@example.com',
      message: 'このレコードは検証用です。確認後Studioから削除してください。',
    }),
  });
  console.log('INSERT status:', insertRes.status);
  if (insertRes.status !== 201) {
    console.error('期待値: 201。INSERTが失敗しています。RLSポリシーかGRANTを確認してください。');
    process.exit(1);
  }

  // 2. SELECTは拒否されるはず（0件 or 権限エラー）
  const selectRes = await fetch(`${url}/rest/v1/inquiries?select=*`, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Accept-Profile': 'site',
    },
  });
  const selectBody = await selectRes.json();
  console.log('SELECT status:', selectRes.status, 'body:', selectBody);
  if (selectRes.status === 200 && Array.isArray(selectBody) && selectBody.length > 0) {
    console.error('期待値: SELECTで既存データが返らないこと。anonにSELECT権限が付与されていないか確認してください。');
    process.exit(1);
  }

  console.log('OK: anonはINSERTのみ可能、SELECTは拒否されることを確認しました。');
}

main();
