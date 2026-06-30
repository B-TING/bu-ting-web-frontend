import type { OAuthLoginData } from '@/types/auth';

interface AccountCardProps {
  user: Omit<OAuthLoginData, 'accessToken' | 'tokenType' | 'expiresIn'>;
  hideUserId: boolean;
}

const PROVIDER_LABEL = {
  google: 'Google',
  naver: 'Naver',
  kakao: 'Kakao',
} as const;

export function AccountCard({ user, hideUserId }: AccountCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">내 계정</h2>
      <dl className="mt-6 space-y-5 text-sm">
        <div>
          <dt className="text-slate-400">닉네임</dt>
          <dd className="mt-1 font-semibold text-slate-800">{user.nickname}</dd>
        </div>
        <div>
          <dt className="text-slate-400">이메일</dt>
          <dd className="mt-1 break-all font-semibold text-slate-800">
            {user.email ?? '등록된 이메일이 없습니다.'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">로그인 방식</dt>
          <dd className="mt-1 font-semibold text-slate-800">{PROVIDER_LABEL[user.provider]}</dd>
        </div>
        <div>
          <dt className="text-slate-400">사용자 ID</dt>
          <dd className="mt-1 break-all font-mono text-xs text-slate-700">
            {hideUserId ? '••••••••••••••••' : user.userId}
          </dd>
        </div>
      </dl>
    </section>
  );
}
