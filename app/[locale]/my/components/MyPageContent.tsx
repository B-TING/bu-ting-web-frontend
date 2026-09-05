'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Bell, Bookmark, Camera, ChevronRight, Globe, Heart, ImageIcon,
  LoaderCircle, LogOut, MapPin, Pencil, Settings, Sparkles, UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import type { MyTravelRecord } from '../api/my-profile';
import {
  useMyProfile,
  useMyTravelRecordBookmarks,
  useMyTravelRecords,
  useMyVisitedPlaceCount,
  useUpdateMyProfile,
} from '../hooks/use-my-profile';

interface ProfileFormState {
  nickname: string;
  profileImageUrl: string;
  firstName: string;
  lastName: string;
}

const EMPTY_PROFILE_FORM: ProfileFormState = {
  nickname: '', profileImageUrl: '', firstName: '', lastName: '',
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.status === 401
      ? '로그인이 만료되었어요. 다시 로그인해 주세요.'
      : error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function profileHandle(nickname: string) {
  const cleaned = nickname.trim().replace(/\s+/g, '').toLowerCase();
  return cleaned ? `@${cleaned}` : '@user';
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return <div className="flex items-baseline gap-1.5"><strong>{value}</strong><span className="text-sm text-slate-500">{label}</span></div>;
}

function SettingRow({ icon, label, href, onClick, danger, last, trailing = true }: {
  icon: ReactNode; label: string; href?: string; onClick?: () => void;
  danger?: boolean; last?: boolean; trailing?: boolean;
}) {
  const classes = `flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 ${last ? '' : 'border-b border-slate-100'} ${danger ? 'text-red-600' : 'text-slate-800'}`;
  const content = <><span className={danger ? 'text-red-500' : 'text-slate-400'}>{icon}</span><span className="flex-1 text-[15px] font-medium">{label}</span>{trailing ? <ChevronRight className="size-4 text-slate-300" /> : null}</>;
  return href ? <Link href={href} className={classes}>{content}</Link> : <button type="button" onClick={onClick} className={classes}>{content}</button>;
}

function RecordGrid({ records, emptyTitle }: { records: MyTravelRecord[]; emptyTitle: string }) {
  if (!records.length) {
    return <div className="rounded-3xl border border-dashed border-slate-200 py-14 text-center"><ImageIcon className="mx-auto size-9 text-slate-300" /><p className="mt-4 font-semibold text-slate-700">{emptyTitle}</p><p className="mt-1 text-sm text-slate-400">여행 기록이 생기면 여기에 표시됩니다.</p></div>;
  }

  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{records.map((record) => (
    <Link key={record.travelRecordId} href={`/stories/${record.travelRecordId}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-sky-50">
      {record.coverImageUrl ? <span className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105" style={{ backgroundImage: `url(${JSON.stringify(record.coverImageUrl).slice(1, -1)})` }} /> : <span className="absolute inset-0 flex items-center justify-center"><MapPin className="size-8 text-sky-600" /></span>}
      {record.status !== 'PUBLISHED' ? <span className="absolute left-2 top-2 rounded-md bg-slate-900/70 px-2 py-1 text-[10px] font-bold text-white">{record.status === 'DRAFT' ? '초안' : '숨김'}</span> : null}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 pb-3 pt-10 text-white"><span className="block truncate text-sm font-semibold">{record.title || '제목 없는 여행기'}</span><span className="mt-1 flex items-center gap-1 text-xs text-white/80"><Heart className="size-3 fill-current" />{record.likeCount}</span></span>
    </Link>
  ))}</div>;
}

export function MyPageContent() {
  const router = useRouter();
  const { user, accessToken, autoLoginEnabled, setAutoLoginEnabled, clearSession } = useAuthStore();
  const profileQuery = useMyProfile(Boolean(accessToken));
  const recordsQuery = useMyTravelRecords(Boolean(accessToken));
  const bookmarksQuery = useMyTravelRecordBookmarks(Boolean(accessToken));
  const visitedQuery = useMyVisitedPlaceCount(recordsQuery.data, Boolean(accessToken));
  const updateProfile = useUpdateMyProfile();
  const [activeTab, setActiveTab] = useState<'mine' | 'bookmarks'>('mine');
  const [isEditing, setIsEditing] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_PROFILE_FORM);

  if (!accessToken) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6"><div className="text-center"><UserRound className="mx-auto size-12 text-slate-300" /><h1 className="mt-5 text-2xl font-bold text-slate-950">로그인이 필요해요</h1><Link href="/auth/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-sky-700 px-6 font-semibold text-white">로그인하러 가기</Link></div></main>;
  }

  const profile = profileQuery.data;
  const nickname = profile?.nickname || user?.nickname || user?.email?.split('@')[0] || 'B-TING 여행자';
  const bookmarkedRecords: MyTravelRecord[] = (bookmarksQuery.data ?? []).map(({ travelRecord }) => ({ ...travelRecord, status: 'PUBLISHED', createdAt: travelRecord.publishedAt, updatedAt: travelRecord.publishedAt }));
  const visibleRecords = activeTab === 'mine' ? recordsQuery.data ?? [] : bookmarkedRecords;
  const activeQuery = activeTab === 'mine' ? recordsQuery : bookmarksQuery;

  const startEditing = () => {
    setForm({ nickname: profile?.nickname ?? '', profileImageUrl: profile?.profileImageUrl ?? '', firstName: profile?.firstName ?? '', lastName: profile?.lastName ?? '' });
    updateProfile.reset();
    setIsEditing(true);
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateProfile.mutateAsync({ nickname: form.nickname.trim(), profileImageUrl: form.profileImageUrl.trim(), firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      setIsEditing(false);
    } catch { /* mutation 오류를 폼에서 표시합니다. */ }
  };

  const logout = () => { clearSession(); router.replace('/auth/login'); };

  return <main className="min-h-screen bg-slate-50 pb-20">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-bold text-sky-950"><MapPin className="size-5 text-sky-700" />B-TING</Link><span className="text-sm font-bold text-slate-900">마이페이지</span></div></header>
    <div className="mx-auto max-w-3xl px-5 py-8">
      <section className="flex items-start gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
        <div className="relative shrink-0"><div className="flex size-24 items-center justify-center rounded-full bg-sky-700 bg-cover bg-center text-3xl font-bold text-white" style={profile?.profileImageUrl ? { backgroundImage: `url(${JSON.stringify(profile.profileImageUrl).slice(1, -1)})` } : undefined}>{!profile?.profileImageUrl ? nickname.slice(0, 1).toUpperCase() : null}</div><button type="button" onClick={startEditing} aria-label="프로필 수정" className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-sky-700 text-white"><Camera className="size-4" /></button></div>
        <div className="min-w-0 flex-1 pt-1"><div className="flex items-center gap-2"><h1 className="truncate text-2xl font-bold text-slate-950">{nickname}</h1><button type="button" onClick={startEditing} aria-label="닉네임 수정" className="text-slate-400 hover:text-sky-700"><Pencil className="size-4" /></button></div><p className="mt-1 truncate text-sm text-slate-500">{profileHandle(nickname)}</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2"><Stat value={recordsQuery.data?.length ?? 0} label="여행기" /><Stat value={visitedQuery.isLoading ? '…' : visitedQuery.data ?? '—'} label="방문 기록" /></div></div>
      </section>

      {isEditing ? <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold text-slate-900">프로필 편집</h2><form className="mt-5 space-y-4" onSubmit={(event) => void submitProfile(event)}><div className="grid gap-4 sm:grid-cols-2">{([['nickname', '닉네임', 'text'], ['profileImageUrl', '프로필 이미지 URL', 'url'], ['lastName', '성', 'text'], ['firstName', '이름', 'text']] as const).map(([key, label, type]) => <label key={key} className="text-sm text-slate-600">{label}<input type={type} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-600" /></label>)}</div>{updateProfile.isError ? <p className="text-sm text-red-600">{errorMessage(updateProfile.error, '회원 정보를 수정하지 못했어요.')}</p> : null}<div className="flex justify-end gap-2"><button type="button" onClick={() => setIsEditing(false)} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700">취소</button><button type="submit" disabled={updateProfile.isPending} className="h-10 rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white disabled:opacity-60">{updateProfile.isPending ? '저장 중...' : '저장'}</button></div></form></section> : null}

      <section className="mt-8"><div className="mb-4 flex gap-6 border-b border-slate-200"><button type="button" onClick={() => setActiveTab('mine')} className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold ${activeTab === 'mine' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'}`}><ImageIcon className="size-4" />내 여행 기록</button><button type="button" onClick={() => setActiveTab('bookmarks')} className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold ${activeTab === 'bookmarks' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'}`}><Bookmark className="size-4" />북마크한 기록</button></div>{activeQuery.isLoading ? <LoaderCircle className="mx-auto my-16 size-7 animate-spin text-sky-700" /> : activeQuery.isError ? <p className="py-14 text-center text-sm text-red-600">여행 기록을 불러오지 못했어요.</p> : <RecordGrid records={visibleRecords} emptyTitle={activeTab === 'mine' ? '아직 여행 기록이 없어요' : '북마크한 여행기가 없어요'} />}</section>

      <section className="mt-9"><h2 className="mb-3 text-lg font-bold text-slate-950">설정</h2><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><SettingRow icon={<Pencil className="size-5" />} label="프로필 편집" onClick={startEditing} /><SettingRow icon={<Sparkles className="size-5" />} label="여행 취향 수정" href="/my/preferences" /><SettingRow icon={<Bell className="size-5" />} label="알림 설정" onClick={() => window.alert('알림 설정은 준비 중이에요.')} /><SettingRow icon={<Globe className="size-5" />} label="언어 설정" href="/language" /><SettingRow icon={<Settings className="size-5" />} label="계정 설정" onClick={() => setAccountOpen((open) => !open)} />
        {accountOpen ? <div className="border-b border-slate-100 bg-slate-50 px-5 py-5">{profileQuery.isLoading ? <LoaderCircle className="mx-auto size-6 animate-spin text-sky-700" /> : profileQuery.isError ? <p className="text-sm text-red-600">회원 정보를 불러오지 못했어요.</p> : <div className="grid gap-5 text-sm sm:grid-cols-2"><div><p className="text-slate-400">이메일</p><p className="mt-1 break-all font-semibold text-slate-800">{profile?.email || user?.email || '정보 없음'}</p></div><div><p className="text-slate-400">로그인 방식</p><p className="mt-1 font-semibold capitalize text-slate-800">{profile?.provider || user?.provider || '알 수 없음'}</p></div><div className="flex items-center justify-between gap-5 sm:col-span-2"><div><p className="text-slate-400">자동 로그인</p><p className="mt-1 text-xs text-slate-500">브라우저를 닫아도 로그인 상태를 유지해요.</p></div><button type="button" role="switch" aria-checked={autoLoginEnabled} onClick={() => setAutoLoginEnabled(!autoLoginEnabled)} className={`relative h-7 w-12 shrink-0 rounded-full ${autoLoginEnabled ? 'bg-sky-700' : 'bg-slate-300'}`}><span className={`absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform ${autoLoginEnabled ? 'translate-x-5' : ''}`} /></button></div></div>}</div> : null}
        <SettingRow icon={<LogOut className="size-5" />} label="로그아웃" onClick={logout} danger trailing={false} last />
      </div></section>
    </div>
  </main>;
}
