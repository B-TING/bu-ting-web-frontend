'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Award,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Gift,
  LayoutDashboard,
  MapPin,
  Plus,
  ShieldCheck,
  Waves,
} from 'lucide-react';
import type {
  AdminEventState,
  AdminEventMission,
  AdminEventRound,
  AdminEventTitle,
} from '@/types/event-admin';
import { ADMIN_EVENT_ZONES } from '@/constants/event-admin';
import {
  advanceReward,
  formatEventDate,
  freezeClosedLikes,
  latestSubmission,
  reviewPhoto,
  roundStatus,
  selectWinner,
} from '@/lib/event-admin';
import { createEventAdminDemo } from '@/lib/event-admin-demo';
import { Action, Empty, Field, inputClass, Modal, Panel, Pill } from './AdminControls';
import MissionEditor from './MissionEditor';
import RoundEditor from './RoundEditor';
import ReviewPanel from './ReviewPanel';
import RewardPanel from './RewardPanel';

const menus = [
  {
    id: 'overview',
    label: '운영 현황',
    icon: LayoutDashboard,
    description: '오늘의 부산, 운영의 흐름을 한눈에.',
  },
  {
    id: 'rounds',
    label: '로테이션 관리',
    icon: CalendarDays,
    description: '네 개의 구역을 연결해 새로운 부산 여행을 만드세요.',
  },
  {
    id: 'missions',
    label: '미션 관리',
    icon: MapPin,
    description: '하나의 미션, 여러 선택 장소. 현장에서 만나는 부산.',
  },
  {
    id: 'reviews',
    label: '사진 인증 검수',
    icon: Camera,
    description: '여행자가 담아온 순간을 확인하고 승인해 주세요.',
  },
  {
    id: 'rewards',
    label: '보상·정산 관리',
    icon: Gift,
    description: '인증의 성취가 보상으로 이어지도록.',
  },
  {
    id: 'titles',
    label: '구역 칭호',
    icon: Award,
    description: '부산을 알아가는 여정에 이름을 붙여주세요.',
  },
  {
    id: 'reports',
    label: '운영 리포트',
    icon: Activity,
    description: '참여부터 보상까지, 회차의 결과를 살펴보세요.',
  },
] as const;
type Section = (typeof menus)[number]['id'];

export default function EventAdmin() {
  const [state, setState] = useState<AdminEventState | null>(null);
  const [now, setNow] = useState(0);
  const [section, setSection] = useState<Section>('overview');
  const [notice, setNotice] = useState('');
  const [missionEditor, setMissionEditor] = useState<AdminEventMission | 'new' | null>(null);
  const [roundEditor, setRoundEditor] = useState<AdminEventRound | 'new' | null>(null);
  const [emergency, setEmergency] = useState<{ roundId: string; missionId?: string } | null>(null);
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [reset, setReset] = useState(false);
  useEffect(() => {
    // Fixtures use relative dates; initialise only on the client to avoid hydration mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(createEventAdminDemo());
    setNow(Date.now());
    const interval = setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      setState((s) => (s ? freezeClosedLikes(s, tick) : s));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  function change(action: string, transform: (s: AdminEventState) => AdminEventState) {
    if (!state) return false;
    try {
      const next = transform(state);
      setState({
        ...next,
        audits: [
          { id: crypto.randomUUID(), at: new Date().toISOString(), action, actor: '샘플 운영자' },
          ...next.audits,
        ],
      });
      setNotice(action);
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : '처리하지 못했습니다.');
      return false;
    }
  }
  function navigate(id: Section) {
    setSection(id);
    setSearch('');
    setStatusFilter('전체');
    setNotice('');
  }
  if (!state)
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        관리자 화면을 준비하고 있습니다.
      </div>
    );
  const current = menus.find((m) => m.id === section)!;
  const pending = state.participations.filter(
    (p) => latestSubmission(p)?.status === 'PENDING'
  ).length;
  const approved = state.participations.filter(
    (p) => latestSubmission(p)?.status === 'APPROVED'
  ).length;
  const waiting = state.participations.filter(
    (p) => latestSubmission(p)?.status === 'APPROVED' && p.delivery === 'PENDING'
  ).length;
  const live = state.rounds.filter((r) => roundStatus(r, now) === '진행 중');
  const zoneName = (id: string) => ADMIN_EVENT_ZONES.find((z) => z.id === id)?.name ?? id;
  function saveMission(m: AdminEventMission, why: string) {
    if (
      change(`미션 ${m.title} 저장${why ? ` · 사유: ${why}` : ''}`, (s) => ({
        ...s,
        missions: s.missions.some((item) => item.id === m.id)
          ? s.missions.map((item) => (item.id === m.id ? m : item))
          : [...s.missions, m],
      }))
    )
      setMissionEditor(null);
  }
  function saveRound(r: AdminEventRound) {
    if (
      change(`로테이션 ${r.name} 저장`, (s) => ({
        ...s,
        rounds: s.rounds.some((item) => item.id === r.id)
          ? s.rounds.map((item) => (item.id === r.id ? r : item))
          : [r, ...s.rounds],
      }))
    )
      setRoundEditor(null);
  }
  const missionList = state.missions.filter((m) =>
    `${m.title} ${zoneName(m.zoneId)} ${m.places.map((p) => p.name).join(' ')}`.includes(search)
  );
  const roundList = state.rounds.filter(
    (r) =>
      r.name.includes(search) && (statusFilter === '전체' || roundStatus(r, now) === statusFilter)
  );
  return (
    <div className="min-h-screen bg-[#f5f7f9] text-slate-800 lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="px-7 pb-8 pt-9">
          <div className="flex items-center gap-2 text-2xl font-black tracking-tight text-teal-800">
            <Waves size={29} />
            B-TING<span className="mb-1 text-teal-400">.</span>
          </div>
          <p className="mt-2 text-[10px] font-semibold tracking-[.2em] text-slate-400">
            BUSAN EVENT CONSOLE
          </p>
        </div>
        <div className="px-4">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-widest text-slate-400">
            이벤트 운영
          </p>
          <nav
            aria-label="관리자 메뉴"
            className="grid gap-1.5"
          >
            {menus.map((m) => (
              <button
                key={m.id}
                aria-current={section === m.id ? 'page' : undefined}
                onClick={() => navigate(m.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${section === m.id ? 'bg-teal-50 text-teal-800' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <m.icon size={18} />
                {m.label}
                {m.id === 'reviews' && pending > 0 && (
                  <span className="ml-auto rounded-md bg-teal-700 px-1.5 text-xs leading-5 text-white">
                    {pending}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <ShieldCheck
              size={20}
              className="text-teal-700"
            />
            <p className="mt-2 text-sm font-bold">운영 화면 미리보기</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              실제 데이터 연동 전<br />
              샘플로 운영 흐름을 확인하세요.
            </p>
          </div>
          <p className="mt-5 text-center text-xs text-slate-400">부산의 다음 장면을 만듭니다.</p>
        </div>
      </aside>
      <header className="flex h-18 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-9">
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-semibold text-slate-600">이벤트 운영</span>
          <ChevronRight size={14} />
          {current.label}
        </p>
        <div className="flex items-center gap-3">
          <Pill tone="teal">샘플 모드</Pill>
          <span className="hidden text-xs text-slate-400 sm:inline">한국 시간 기준</span>
          <div className="grid size-8 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
            운영
          </div>
        </div>
      </header>
      <nav
        aria-label="모바일 관리자 메뉴"
        className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden"
      >
        {menus.map((m) => (
          <button
            key={m.id}
            onClick={() => navigate(m.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs ${section === m.id ? 'bg-teal-700 text-white' : 'bg-slate-50 text-slate-600'}`}
          >
            {m.label}
          </button>
        ))}
      </nav>
      <main className="mx-auto max-w-[1450px] px-5 py-7 md:px-9 md:py-9">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-teal-700">부산 구역 이벤트</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{current.label}</h1>
            <p className="mt-2 text-sm text-slate-500">{current.description}</p>
          </div>
          {section === 'rounds' || section === 'overview' ? (
            <Action
              primary
              onClick={() => setRoundEditor('new')}
            >
              <Plus size={17} />
              로테이션 만들기
            </Action>
          ) : section === 'missions' ? (
            <Action
              primary
              onClick={() => setMissionEditor('new')}
            >
              <Plus size={17} />
              미션 만들기
            </Action>
          ) : null}
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-xs leading-5 text-amber-900">
          <span>
            샘플 데이터로 동작합니다. 새로고침 시 초기화되며, 실제 승인·메일 발송·보상 지급은
            수행하지 않습니다.
          </span>
          <button
            className="font-bold underline underline-offset-2"
            onClick={() => setReset(true)}
          >
            샘플 초기화
          </button>
        </div>
        {notice && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-white p-4 text-sm text-teal-900"
          >
            <span>{notice}</span>
            <button
              aria-label="알림 닫기"
              onClick={() => setNotice('')}
              className="px-2"
            >
              ×
            </button>
          </div>
        )}
        {section === 'overview' && (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  name: '진행 중 로테이션',
                  value: live.length,
                  unit: '회차',
                  icon: CalendarDays,
                  sub: '시간에 따라 자동 운영',
                  target: 'rounds',
                },
                {
                  name: '사진 검수 대기',
                  value: pending,
                  unit: '건',
                  icon: Camera,
                  sub: '여행자의 순간을 확인해 주세요',
                  target: 'reviews',
                },
                {
                  name: '보상 확정 대기',
                  value: waiting,
                  unit: '건',
                  icon: Gift,
                  sub: '승인 후 별도 보상 확정',
                  target: 'rewards',
                },
                {
                  name: '누적 인증 성공',
                  value: approved,
                  unit: '건',
                  icon: CheckCircle2,
                  sub: '운영자가 승인한 참여',
                  target: 'reports',
                },
              ].map((card) => (
                <button
                  key={card.name}
                  onClick={() => navigate(card.target as Section)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition-shadow hover:shadow-md"
                >
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{card.name}</span>
                    <card.icon
                      size={19}
                      className="text-teal-600"
                    />
                  </div>
                  <p className="my-4 text-3xl font-bold tracking-tight">
                    {card.value}
                    <span className="ml-2 text-sm font-normal text-slate-400">{card.unit}</span>
                  </p>
                  <p className="text-xs text-slate-400">{card.sub}</p>
                </button>
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Panel>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">오늘 열린 구역</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      구역마다 하나의 미션, 나만의 장소에서 참여
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('rounds')}
                    className="flex items-center gap-1 text-xs text-teal-700"
                  >
                    전체 보기
                    <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ADMIN_EVENT_ZONES.map((z, i) => {
                    const r = live.find(
                      (r) =>
                        r.missionIds.some(
                          (id) => state.missions.find((m) => m.id === id)?.zoneId === z.id
                        ) &&
                        !r.cancelledMissionIds.some(
                          (id) => state.missions.find((m) => m.id === id)?.zoneId === z.id
                        )
                    );
                    const m =
                      r &&
                      state.missions.find((m) => r.missionIds.includes(m.id) && m.zoneId === z.id);
                    return (
                      <div
                        key={z.id}
                        className={`relative overflow-hidden rounded-xl border p-5 ${r ? 'border-teal-100 bg-teal-50/50' : 'border-slate-100 bg-slate-50'}`}
                      >
                        <span className="absolute right-3 top-3 text-4xl font-black text-slate-200/50">
                          0{i + 1}
                        </span>
                        <Pill tone={r ? 'teal' : 'slate'}>{r ? 'OPEN' : 'REST'}</Pill>
                        <h3 className="mt-3 text-sm font-bold">{z.name}</h3>
                        <p className="mt-2 text-xs text-slate-500">
                          {m?.title ?? '다음 여행을 준비하고 있어요'}
                        </p>
                        {r && (
                          <p className="mt-3 flex items-center gap-1 text-[11px] text-teal-700">
                            <Clock3 size={12} />
                            {formatEventDate(r.endsAt)} 종료
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>
              <div className="grid content-start gap-5">
                <div className="rounded-2xl bg-[#123e3b] p-6 text-white">
                  <Compass
                    size={28}
                    className="text-teal-300"
                  />
                  <p className="mt-5 text-xl font-semibold leading-8">
                    작은 인증 하나가
                    <br />
                    부산의 추억이 됩니다.
                  </p>
                  <p className="mt-3 text-xs leading-6 text-teal-100/70">
                    사진 검수를 마치고
                    <br />
                    여행자의 다음 성취를 열어주세요.
                  </p>
                  <button
                    onClick={() => navigate('reviews')}
                    className="mt-6 flex w-full items-center justify-between rounded-xl bg-white/10 p-3 text-sm"
                  >
                    검수하러 가기
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <Panel>
                  <h3 className="text-sm font-bold">운영 체크포인트</h3>
                  <ul className="mt-4 grid gap-4 text-xs leading-5 text-slate-500">
                    <li>01 · 종료 시각에 제출·재제출·좋아요 마감</li>
                    <li>02 · 사진 승인과 보상 확정은 별도 처리</li>
                    <li>03 · 신고 대상은 최종 검수 후 지급</li>
                  </ul>
                </Panel>
              </div>
            </div>
          </div>
        )}
        {section === 'rounds' && (
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-3">
              <input
                aria-label="로테이션 검색"
                className={`${inputClass} max-w-80`}
                placeholder="회차명 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                aria-label="로테이션 상태"
                className={`${inputClass} max-w-40`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {['전체', '예정', '진행 중', '종료', '취소'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            {!roundList.length && (
              <Empty>등록된 로테이션이 없습니다. 새 회차를 만들어 주세요.</Empty>
            )}
            {roundList.map((r) => (
              <Panel key={r.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Pill tone={roundStatus(r, now) === '진행 중' ? 'teal' : 'slate'}>
                        {roundStatus(r, now)}
                      </Pill>
                      <span className="text-xs text-slate-400">4개 구역 로테이션</span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold">{r.name}</h2>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatEventDate(r.startsAt)} → {formatEventDate(r.endsAt)} · KST
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {roundStatus(r, now) === '예정' && (
                      <Action onClick={() => setRoundEditor(r)}>편집</Action>
                    )}
                    {['예정', '진행 중'].includes(roundStatus(r, now)) && (
                      <Action
                        onClick={() => {
                          setEmergency({ roundId: r.id });
                          setReason('');
                        }}
                      >
                        긴급 취소
                      </Action>
                    )}
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {r.missionIds.map((id) => {
                    const m = state.missions.find((m) => m.id === id);
                    if (!m) return null;
                    return (
                      <div
                        key={id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="text-xs font-semibold text-teal-700">{zoneName(m.zoneId)}</p>
                        <h3 className="my-2 text-sm font-bold">{m.title}</h3>
                        <p className="text-xs leading-5 text-slate-400">
                          {m.places.map((p) => p.name).join(' / ')}
                        </p>
                        {r.cancelledMissionIds.includes(id) ? (
                          <div className="mt-3">
                            <Pill tone="red">구역 취소 · 기존 이력 인정</Pill>
                          </div>
                        ) : (
                          roundStatus(r, now) === '진행 중' && (
                            <div className="mt-3 flex gap-3 text-xs text-slate-500">
                              <button
                                className="underline"
                                onClick={() => setMissionEditor(m)}
                              >
                                긴급 변경
                              </button>
                              <button
                                className="text-rose-700 underline"
                                onClick={() => {
                                  setEmergency({ roundId: r.id, missionId: id });
                                  setReason('');
                                }}
                              >
                                구역 취소
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  특별 보상: 구역별 Top {r.topN} · {r.specialReward}
                </p>
              </Panel>
            ))}
          </div>
        )}
        {section === 'missions' && (
          <div className="grid gap-5">
            <input
              aria-label="미션 검색"
              className={`${inputClass} max-w-96`}
              placeholder="미션, 구역 또는 장소 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {missionList.map((m) => (
                <Panel key={m.id}>
                  <div className="flex items-center justify-between">
                    <Pill tone="teal">{zoneName(m.zoneId)}</Pill>
                    <MapPin
                      size={18}
                      className="text-slate-300"
                    />
                  </div>
                  <h2 className="mt-4 font-bold">{m.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {m.condition}
                  </p>
                  <div className="my-4 rounded-xl bg-slate-50 p-3">
                    {m.places.map((p) => (
                      <p
                        key={p.id}
                        className="py-1 text-xs text-slate-600"
                      >
                        {p.name} <span className="text-slate-400">· {p.radius}m</span>
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {m.points}P · {m.kind === 'PLACE_AUTH' ? '장소 인증' : '사물 인증'}
                    </span>
                    <Action onClick={() => setMissionEditor(m)}>상세·수정</Action>
                  </div>
                </Panel>
              ))}
            </div>
            {!missionList.length && <Empty>검색 결과가 없습니다.</Empty>}
          </div>
        )}
        {section === 'reviews' && (
          <ReviewPanel
            state={state}
            now={now}
            review={(id, approve, why) =>
              change(`사진 ${approve ? '승인' : '반려'} · ${id}${why ? ` · ${why}` : ''}`, (s) =>
                reviewPhoto(s, id, approve, why)
              )
            }
          />
        )}
        {section === 'rewards' && (
          <RewardPanel
            state={state}
            now={now}
            winner={(id, value) =>
              change(`Top 수상자 ${value ? '선택' : '해제'} · ${id}`, (s) =>
                selectWinner(s, id, value, Date.now())
              )
            }
            advance={(ids, special) =>
              change(`${special ? '특별' : '기본'} 보상 처리 단계 변경 · ${ids.join(', ')}`, (s) =>
                advanceReward(s, ids, Date.now(), special)
              )
            }
            schedule={(ids, at) =>
              change(`지급 일정 변경 · ${ids.join(', ')} · ${formatEventDate(at)}`, (s) => ({
                ...s,
                participations: s.participations.map((p) =>
                  ids.includes(p.id) && (p.delivery !== 'SENT' || p.specialDelivery !== 'SENT')
                    ? { ...p, rewardAt: at }
                    : p
                ),
              }))
            }
            resolve={(id, why) =>
              change(`신고 최종 검수 완료 · ${id} · ${why}`, (s) => ({
                ...s,
                participations: s.participations.map((p) =>
                  p.id === id ? { ...p, reportResolved: true } : p
                ),
              }))
            }
          />
        )}
        {section === 'titles' && (
          <TitlePanel
            state={state}
            save={(title) =>
              change(`칭호 기준 저장 · ${zoneName(title.zoneId)}`, (s) => ({
                ...s,
                titles: s.titles.map((t) => (t.zoneId === title.zoneId ? title : t)),
              }))
            }
          />
        )}
        {section === 'reports' && (
          <div className="grid gap-5">
            <Panel>
              <h2 className="mb-5 font-bold">회차별 참여·보상 현황</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-400">
                      {['회차', '참여', '승인', '승인율', '신고 보류', '기본 보상 완료'].map(
                        (v) => (
                          <th
                            key={v}
                            className="pb-3 font-medium"
                          >
                            {v}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {state.rounds.map((r) => {
                      const ps = state.participations.filter((p) => p.roundId === r.id);
                      const success = ps.filter(
                        (p) => latestSubmission(p)?.status === 'APPROVED'
                      ).length;
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-4 font-medium">{r.name}</td>
                          <td>{ps.length}</td>
                          <td>{success}</td>
                          <td>{ps.length ? Math.round((success / ps.length) * 100) : 0}%</td>
                          <td>{ps.filter((p) => p.reported && !p.reportResolved).length}</td>
                          <td>{ps.filter((p) => p.delivery === 'SENT').length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
            <Panel>
              <h2 className="mb-4 font-bold">운영 처리 이력</h2>
              {!state.audits.length ? (
                <Empty>운영자가 처리한 내역이 여기에 기록됩니다.</Empty>
              ) : (
                <ol className="divide-y divide-slate-100">
                  {state.audits.map((a) => (
                    <li
                      key={a.id}
                      className="py-3"
                    >
                      <p className="text-sm">{a.action}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {a.actor} · {formatEventDate(a.at)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        )}
      </main>
      {missionEditor && (
        <MissionEditor
          mission={missionEditor === 'new' ? undefined : missionEditor}
          lockedZone={
            missionEditor !== 'new' &&
            state.rounds.some((r) => r.missionIds.includes(missionEditor.id))
          }
          save={saveMission}
          close={() => setMissionEditor(null)}
        />
      )}
      {roundEditor && (
        <RoundEditor
          state={state}
          round={roundEditor === 'new' ? undefined : roundEditor}
          save={saveRound}
          close={() => setRoundEditor(null)}
        />
      )}
      {emergency && (
        <Modal
          title="긴급 운영 취소"
          close={() => setEmergency(null)}
        >
          <p className="mb-4 text-sm leading-6 text-slate-600">
            {emergency.missionId ? '해당 구역' : '해당 회차 전체'}의 신규 참여를 중단합니다. 기존
            참여·제출 사진·성공·보상 기록은 유지하며 남은 검수를 계속할 수 있습니다.
          </p>
          <Field label="취소 사유">
            <textarea
              required
              className={inputClass}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <Action onClick={() => setEmergency(null)}>돌아가기</Action>
            <Action
              primary
              disabled={!reason.trim()}
              onClick={() => {
                if (
                  change(
                    `긴급 취소 · ${emergency.roundId} ${emergency.missionId ?? '전체'} · ${reason}`,
                    (s) => ({
                      ...s,
                      rounds: s.rounds.map((r) =>
                        r.id === emergency.roundId
                          ? emergency.missionId
                            ? {
                                ...r,
                                cancelledMissionIds: [
                                  ...r.cancelledMissionIds,
                                  emergency.missionId,
                                ],
                              }
                            : { ...r, cancelled: true }
                          : r
                      ),
                    })
                  )
                )
                  setEmergency(null);
              }}
            >
              기존 이력 유지하고 취소
            </Action>
          </div>
        </Modal>
      )}
      {reset && (
        <Modal
          title="샘플 초기화"
          close={() => setReset(false)}
        >
          <p className="text-sm">이 화면에서 변경한 샘플 기록을 초기 상태로 되돌립니다.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Action onClick={() => setReset(false)}>돌아가기</Action>
            <Action
              primary
              onClick={() => {
                setState(createEventAdminDemo());
                setReset(false);
                setNotice('샘플 데이터를 초기화했습니다.');
              }}
            >
              초기화
            </Action>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TitlePanel({
  state,
  save,
}: {
  state: AdminEventState;
  save: (t: AdminEventTitle) => boolean;
}) {
  const [draft, setDraft] = useState<AdminEventTitle | null>(null);
  const [error, setError] = useState('');
  return (
    <div className="grid gap-5">
      <p className="text-sm text-slate-500">
        누적 승인 횟수 기준입니다. 1·3·7회는 초기 예시이며 저장 전 단계를 확인하세요. 기존 획득
        칭호의 소급 변경은 서버 정책 확정 후 연동합니다.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.titles.map((t) => (
          <Panel key={t.zoneId}>
            <div className="flex items-center gap-2">
              <Award
                size={18}
                className="text-amber-500"
              />
              <h2 className="text-sm font-bold">
                {ADMIN_EVENT_ZONES.find((z) => z.id === t.zoneId)?.name}
              </h2>
            </div>
            <ol className="my-5 grid gap-3">
              {t.names.map((name, i) => {
                const users = new Set(
                  state.participations
                    .filter(
                      (p) =>
                        latestSubmission(p)?.status === 'APPROVED' &&
                        state.missions.find((m) => m.id === p.missionId)?.zoneId === t.zoneId
                    )
                    .map((p) => p.userId)
                );
                const count = [...users].filter(
                  (userId) =>
                    state.participations.filter(
                      (p) =>
                        p.userId === userId &&
                        latestSubmission(p)?.status === 'APPROVED' &&
                        state.missions.find((m) => m.id === p.missionId)?.zoneId === t.zoneId
                    ).length >= t.thresholds[i]
                ).length;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                  >
                    <span className="text-xs font-bold text-teal-700">T{i + 1}</span>
                    <span className="text-sm">{name}</span>
                    <span className="ml-auto text-xs text-slate-400">
                      {t.thresholds[i]}회 · {count}명 달성
                    </span>
                  </li>
                );
              })}
            </ol>
            <Action
              onClick={() => {
                setDraft(structuredClone(t));
                setError('');
              }}
            >
              칭호 기준 편집
            </Action>
          </Panel>
        ))}
      </div>
      {draft && (
        <Modal
          title="구역 칭호 기준"
          close={() => setDraft(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                draft.names.some((n) => !n.trim()) ||
                draft.thresholds.some(
                  (n, i) => !Number.isInteger(n) || n < 1 || (i > 0 && n <= draft.thresholds[i - 1])
                )
              ) {
                setError('칭호명을 입력하고 달성 횟수를 양의 정수로 오름차순 설정해 주세요.');
                return;
              }
              if (save(draft)) setDraft(null);
            }}
            className="grid gap-4"
          >
            {draft.names.map((name, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_110px] gap-3"
              >
                <Field label={`T${i + 1} 칭호명`}>
                  <input
                    required
                    className={inputClass}
                    value={name}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        names: draft.names.map((n, j) => (j === i ? e.target.value : n)),
                      })
                    }
                  />
                </Field>
                <Field label="누적 성공 횟수">
                  <input
                    required
                    type="number"
                    min={1}
                    className={inputClass}
                    value={draft.thresholds[i]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        thresholds: draft.thresholds.map((n, j) =>
                          j === i ? e.target.valueAsNumber : n
                        ),
                      })
                    }
                  />
                </Field>
              </div>
            ))}
            {error && (
              <p
                role="alert"
                className="text-sm text-rose-700"
              >
                {error}
              </p>
            )}
            <Action
              primary
              type="submit"
            >
              기준 저장
            </Action>
          </form>
        </Modal>
      )}
    </div>
  );
}
