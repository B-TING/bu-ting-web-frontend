'use client';

import { use, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMyTravels } from '@/hooks/use-my-travels';
import { useConfirmTravelSettlement, useCreateTravelExpense, useTravelExpenses, useTravelExpenseSummary, useTravelSettlement } from '@/hooks/use-travel-expenses';
import { useTravelMembers } from '@/hooks/use-travel-team';
import { cn } from '@/lib/utils';
import type { ApiExpenseCategory, TravelExpenseCreateRequest } from '@/types/budget';
import type { TravelMemberResponse } from '@/types/travel';
import { RebootFab } from '../../components/RebootFab';
import { TripTabHeader } from '../../components/TripTabHeader';

const CATEGORIES: ApiExpenseCategory[] = ['FOOD', 'SHOPPING', 'ACCOMMODATION', 'TRANSPORT', 'ACTIVITY', 'ETC'];
const CATEGORY_KEY: Record<ApiExpenseCategory, string> = {
  FOOD: 'food', SHOPPING: 'shopping', ACCOMMODATION: 'accommodation',
  TRANSPORT: 'transport', ACTIVITY: 'experience', ETC: 'other',
};
const CATEGORY_COLORS: Record<ApiExpenseCategory, string> = {
  FOOD: 'bg-orange-100 text-orange-700', SHOPPING: 'bg-pink-100 text-pink-700',
  ACCOMMODATION: 'bg-purple-100 text-purple-700', TRANSPORT: 'bg-blue-100 text-blue-700',
  ACTIVITY: 'bg-green-100 text-green-700', ETC: 'bg-gray-100 text-gray-600',
};

interface ExpenseFormData {
  title: string;
  payerId: string;
  participantIds: string[];
  date: string;
  category: ApiExpenseCategory;
  amount: string;
  memo: string;
}

function AddExpenseModal({ members, isSaving, hasError, onClose, onSave }: {
  members: TravelMemberResponse[];
  isSaving: boolean;
  hasError: boolean;
  onClose: () => void;
  onSave: (request: TravelExpenseCreateRequest) => void;
}) {
  const t = useTranslations('trip.budget');
  const allMemberIds = useMemo(() => members.map((member) => member.userId), [members]);
  const [form, setForm] = useState<ExpenseFormData>({
    title: '', payerId: members[0]?.userId ?? '', participantIds: allMemberIds,
    date: new Date().toISOString().slice(0, 10), category: 'FOOD', amount: '', memo: '',
  });
  const amount = Number(form.amount);
  const isValid = form.title.trim().length > 0 && Number.isInteger(amount) && amount > 0
    && Boolean(form.payerId) && form.participantIds.length > 0;

  const toggleParticipant = (userId: string) => setForm((current) => ({
    ...current,
    participantIds: current.participantIds.includes(userId)
      ? current.participantIds.filter((id) => id !== userId)
      : [...current.participantIds, userId],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-gray-900">{t('addTitle')}</h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-gray-700">항목명
            <input value={form.title} maxLength={50} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예: 광안리 저녁 식사" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <div><p className="text-sm font-medium text-gray-700">{t('labelPayer')}</p><div className="mt-2 flex flex-wrap gap-2">
            {members.map((member) => <button key={member.userId} type="button" onClick={() => setForm((f) => ({ ...f, payerId: member.userId }))}
              className={cn('rounded-full border px-3 py-1.5 text-sm', form.payerId === member.userId ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-600')}>{member.nickname}</button>)}
          </div></div>
          <div><p className="text-sm font-medium text-gray-700">{t('labelSplit')}</p><div className="mt-2 flex flex-wrap gap-2">
            {members.map((member) => <button key={member.userId} type="button" onClick={() => toggleParticipant(member.userId)}
              className={cn('rounded-full border px-3 py-1.5 text-sm', form.participantIds.includes(member.userId) ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-600')}>
              {form.participantIds.includes(member.userId) ? '✓ ' : ''}{member.nickname}</button>)}
          </div></div>
          <label className="block text-sm font-medium text-gray-700">{t('labelDate')}
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5" />
          </label>
          <div><p className="text-sm font-medium text-gray-700">{t('labelItem')}</p><div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => <button key={category} type="button" onClick={() => setForm((f) => ({ ...f, category }))}
              className={cn('rounded-full border px-3 py-1.5 text-sm', form.category === category ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-600')}>
              {t(`category.${CATEGORY_KEY[category]}`)}</button>)}
          </div></div>
          <label className="block text-sm font-medium text-gray-700">{t('colAmount')}
            <input type="number" min="1" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-gray-700">{t('labelMemo')}
            <input value={form.memo} maxLength={500} onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5" />
          </label>
        </div>
        {hasError && <p className="mt-4 text-sm text-red-500">경비를 저장하지 못했습니다.</p>}
        <div className="mt-6 space-y-2">
          <button type="button" disabled={!isValid || isSaving} onClick={() => onSave({
            title: form.title.trim(), amount, currency: 'KRW', category: form.category,
            payerId: form.payerId, participantIds: form.participantIds,
            spentAt: `${form.date}T12:00:00`, memo: form.memo.trim() || null,
          })} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:bg-gray-200">
            {isSaving ? '저장 중…' : t('save')}
          </button>
          <button type="button" onClick={onClose} className="w-full py-2 text-sm text-gray-500">{t('cancel')}</button>
        </div>
      </div>
    </div>
  );
}

export default function TripBudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const t = useTranslations('trip.budget');
  const [showModal, setShowModal] = useState(false);
  const expensesQuery = useTravelExpenses(tripId);
  const summaryQuery = useTravelExpenseSummary(tripId);
  const settlementQuery = useTravelSettlement(tripId);
  const membersQuery = useTravelMembers(tripId);
  const travelsQuery = useMyTravels();
  const createExpense = useCreateTravelExpense(tripId);
  const confirmSettlement = useConfirmTravelSettlement(tripId);
  const trip = travelsQuery.data?.find((item) => item.travelId === tripId);
  const expenses = expensesQuery.data?.content ?? [];
  const krwSummary = summaryQuery.data?.currencySummaries.find((item) => item.currency === 'KRW');

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TripTabHeader tripTitle={trip?.title ?? '여행 가계부'} tripId={tripId} backHref="/trips" />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-6 py-8">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between"><div>
            <p className="mb-1 text-sm text-gray-500">{t('totalExpense')}</p>
            <p className="text-3xl font-bold text-blue-600">₩{(krwSummary?.totalAmount ?? 0).toLocaleString()}</p>
            <p className="mt-1 text-xs text-gray-400">{t('expenseCount', { count: summaryQuery.data?.expenseCount ?? 0 })}</p>
          </div><button type="button" disabled={!membersQuery.data?.length || settlementQuery.data?.confirmed} onClick={() => setShowModal(true)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300">
            {settlementQuery.data?.confirmed ? '정산 확정됨' : t('addExpense')}</button></div>
        </section>

        {krwSummary && krwSummary.categorySummaries.length > 0 && <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('byCategory')}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{krwSummary.categorySummaries.map((item) => <div key={item.category} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[item.category])}>{t(`category.${CATEGORY_KEY[item.category]}`)}</span>
            <p className="mt-2 font-bold text-gray-900">₩{item.amount.toLocaleString()}</p><p className="mt-1 text-xs text-gray-400">{Math.round(item.ratio * 100)}%</p>
          </div>)}</div>
        </section>}

        <section><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('expenseList')}</h2>
          {expensesQuery.isPending ? <StateBox text="경비를 불러오는 중입니다." /> : expensesQuery.isError ? <StateBox text="경비를 불러오지 못했습니다." error /> : expenses.length === 0 ?
            <StateBox text={`${t('empty')} ${t('emptyDesc')}`} /> :
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">{expenses.map((expense) => <div key={expense.expenseId} className="grid grid-cols-[1fr_auto] gap-4 border-b border-gray-100 px-5 py-4 last:border-0">
              <div><div className="flex items-center gap-2"><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[expense.category])}>{t(`category.${CATEGORY_KEY[expense.category]}`)}</span><p className="font-medium text-gray-900">{expense.title}</p></div>
                <p className="mt-1 text-xs text-gray-400">{expense.payer.nickname} 결제 · {expense.participantCount}명 분담 · {expense.spentAt.slice(0, 10)}</p></div>
              <p className="self-center font-bold text-gray-900">₩{expense.amount.toLocaleString()}</p>
            </div>)}</div>}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">정산</h2>{settlementQuery.data?.confirmed ? <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">확정 완료</span> : trip?.role === 'LEADER' && <button type="button" disabled={confirmSettlement.isPending || !settlementQuery.data} onClick={() => confirmSettlement.mutate()} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">{confirmSettlement.isPending ? '확정 중…' : '정산 확정'}</button>}
        </div>{settlementQuery.isPending ? <p className="mt-4 text-sm text-gray-400">정산 내역을 계산하는 중입니다.</p> : settlementQuery.isError ? <p className="mt-4 text-sm text-red-500">정산 내역을 불러오지 못했습니다.</p> : settlementQuery.data?.transfers.length ?
          <div className="mt-4 space-y-2">{settlementQuery.data.transfers.map((transfer, index) => <div key={`${transfer.senderId}-${transfer.receiverId}-${index}`} className="flex justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
            <span>{transfer.senderNickname} → {transfer.receiverNickname}</span><strong className="text-blue-600">₩{transfer.amount.toLocaleString()}</strong>
          </div>)}</div> : <p className="mt-4 text-sm text-gray-400">정산할 금액이 없습니다.</p>}
          {confirmSettlement.isError && <p className="mt-3 text-sm text-red-500">정산을 확정하지 못했습니다.</p>}
        </section>
      </main>
      {showModal && membersQuery.data && <AddExpenseModal members={membersQuery.data} isSaving={createExpense.isPending} hasError={createExpense.isError}
        onClose={() => setShowModal(false)} onSave={(request) => createExpense.mutate(request, { onSuccess: () => setShowModal(false) })} />}
      <RebootFab tripId={tripId} />
    </div>
  );
}

function StateBox({ text, error = false }: { text: string; error?: boolean }) {
  return <div className={cn('rounded-2xl bg-white p-10 text-center text-sm', error ? 'text-red-500' : 'text-gray-400')}>{text}</div>;
}
