'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TripTabHeader } from '@/features/trip/components/TripTabHeader';

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = '식비' | '쇼핑' | '숙박비' | '교통비' | '관람·체험' | '기타';

interface Expense {
  id: string;
  category: Category;
  amount: number;
  date: string;
  payer: string;
  splitWith: string[];
  memo: string;
}

interface ExpenseFormData {
  payer: string;
  splitWith: string[];
  date: string;
  category: Category;
  amount: string;
  memo: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['식비', '쇼핑', '숙박비', '교통비', '관람·체험', '기타'];

const CATEGORY_COLORS: Record<Category, string> = {
  '식비': 'bg-orange-100 text-orange-700',
  '쇼핑': 'bg-pink-100 text-pink-700',
  '숙박비': 'bg-purple-100 text-purple-700',
  '교통비': 'bg-blue-100 text-blue-700',
  '관람·체험': 'bg-green-100 text-green-700',
  '기타': 'bg-gray-100 text-gray-600',
};

const MOCK_COMPANIONS = ['여행자', '일행 1', '일행 2'];

const MOCK_TRIP = {
  title: 'B-Side of Busan',
};

const INITIAL_FORM: ExpenseFormData = {
  payer: '여행자',
  splitWith: ['전원'],
  date: new Date().toISOString().split('T')[0],
  category: '식비',
  amount: '',
  memo: '',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ChipButton({
  label,
  active,
  onClick,
  checkmark = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  checkmark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
        active
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
      )}
    >
      {checkmark && active ? `✓ ${label}` : label}
    </button>
  );
}

function ExpenseRow({
  expense,
  expanded,
  onToggle,
}: {
  expense: Expense;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="py-3 px-4">
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', CATEGORY_COLORS[expense.category])}>
            {expense.category}
          </span>
        </td>
        <td className="py-3 px-4 text-right font-semibold text-gray-900">
          ₩{expense.amount.toLocaleString()}
        </td>
        <td className="py-3 px-4 text-right text-gray-400 text-sm">
          {expense.date.slice(5).replace('-', '-')}
        </td>
        <td className="py-3 px-4 text-center text-gray-400">
          <span className={cn('inline-block transition-transform', expanded ? 'rotate-180' : '')}>
            ▾
          </span>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-blue-50/40">
          <td colSpan={4} className="px-6 py-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">항목</p>
                <p className="text-gray-800 font-medium">{expense.category}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">지불자</p>
                <p className="text-gray-800 font-medium">{expense.payer}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">나누기</p>
                <p className="text-gray-800 font-medium">{expense.splitWith.join(', ')}</p>
              </div>
              {expense.memo && (
                <div className="col-span-3">
                  <p className="text-gray-400 text-xs mb-0.5">메모</p>
                  <p className="text-gray-800">{expense.memo}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────

function AddExpenseModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
}) {
  const [form, setForm] = useState<ExpenseFormData>(INITIAL_FORM);

  const toggleSplit = (name: string) => {
    if (name === '전원') {
      setForm((f) => ({ ...f, splitWith: f.splitWith.includes('전원') ? [] : ['전원'] }));
      return;
    }
    setForm((f) => {
      const withoutAll = f.splitWith.filter((v) => v !== '전원');
      const next = withoutAll.includes(name)
        ? withoutAll.filter((v) => v !== name)
        : [...withoutAll, name];
      return { ...f, splitWith: next };
    });
  };

  const handleSave = () => {
    const amount = parseInt(form.amount.replace(/,/g, ''), 10);
    if (!form.amount || isNaN(amount) || amount <= 0) return;
    onSave({
      category: form.category,
      amount,
      date: form.date,
      payer: form.payer,
      splitWith: form.splitWith.length === 0 ? ['전원'] : form.splitWith,
      memo: form.memo,
    });
    onClose();
  };

  const isValid = form.amount !== '' && parseInt(form.amount, 10) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">지출 추가</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* 지불자 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">지불자</label>
            <div className="flex flex-wrap gap-2">
              {MOCK_COMPANIONS.map((name) => (
                <ChipButton
                  key={name}
                  label={name}
                  active={form.payer === name}
                  onClick={() => setForm((f) => ({ ...f, payer: name }))}
                />
              ))}
            </div>
          </div>

          {/* 나누기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">나누기</label>
            <div className="flex flex-wrap gap-2">
              {['전원', ...MOCK_COMPANIONS].map((name) => (
                <ChipButton
                  key={name}
                  label={name}
                  active={form.splitWith.includes(name)}
                  onClick={() => toggleSplit(name)}
                  checkmark
                />
              ))}
            </div>
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 항목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">항목</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <ChipButton
                  key={cat}
                  label={cat}
                  active={form.category === cat}
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                />
              ))}
            </div>
          </div>

          {/* 금액 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">금액</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₩</span>
              <input
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
            <input
              type="text"
              placeholder="메모를 입력하세요"
              value={form.memo}
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OCR 안내 */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400">
            <span>📷</span>
            <span>영수증 OCR — 곧 제공 예정</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 space-y-2">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-sm transition-all',
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Summary ─────────────────────────────────────────────────────────

function CategorySummary({ expenses }: { expenses: Expense[] }) {
  const totals = CATEGORIES.reduce<Record<Category, number>>((acc, cat) => {
    acc[cat] = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {} as Record<Category, number>);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      {CATEGORIES.map((cat) => {
        const amount = totals[cat];
        const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
        return (
          <div key={cat} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', CATEGORY_COLORS[cat])}>
              {cat}
            </span>
            <p className="mt-2 text-sm font-bold text-gray-900">₩{amount.toLocaleString()}</p>
            <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">{pct}%</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface TripBudgetPageProps {
  params: Promise<{ tripId: string }>;
}

export default function TripBudgetPage({ params }: TripBudgetPageProps) {
  const { tripId } = use(params);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [
      ...prev,
      { ...expense, id: `e-${Date.now()}` },
    ]);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TripTabHeader
        tripTitle={MOCK_TRIP.title}
        tripId={tripId}
        backHref="/trips"
      />

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">총 지출</p>
              <p className={cn('text-3xl font-bold', total > 0 ? 'text-blue-600' : 'text-gray-400')}>
                ₩{total.toLocaleString()}
              </p>
              {expenses.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{expenses.length}건의 지출</p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              + 지출 추가
            </button>
          </div>

          {/* Category bar */}
          {expenses.length > 0 && total > 0 && (
            <div className="mt-4">
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                {CATEGORIES.map((cat) => {
                  const amt = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
                  const pct = (amt / total) * 100;
                  if (pct === 0) return null;
                  const barColors: Record<Category, string> = {
                    '식비': 'bg-orange-400',
                    '쇼핑': 'bg-pink-400',
                    '숙박비': 'bg-purple-400',
                    '교통비': 'bg-blue-400',
                    '관람·체험': 'bg-green-400',
                    '기타': 'bg-gray-300',
                  };
                  return (
                    <div
                      key={cat}
                      className={cn('h-full transition-all', barColors[cat])}
                      style={{ width: `${pct}%` }}
                      title={`${cat}: ₩${amt.toLocaleString()}`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {CATEGORIES.filter((cat) =>
                  expenses.some((e) => e.category === cat)
                ).map((cat) => {
                  const dotColors: Record<Category, string> = {
                    '식비': 'bg-orange-400',
                    '쇼핑': 'bg-pink-400',
                    '숙박비': 'bg-purple-400',
                    '교통비': 'bg-blue-400',
                    '관람·체험': 'bg-green-400',
                    '기타': 'bg-gray-300',
                  };
                  return (
                    <span key={cat} className="flex items-center gap-1 text-xs text-gray-500">
                      <span className={cn('w-2 h-2 rounded-full', dotColors[cat])} />
                      {cat}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        {expenses.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              항목별 지출
            </h2>
            <CategorySummary expenses={expenses} />
          </div>
        )}

        {/* Expense list */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            지출 내역
          </h2>

          {expenses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <p className="text-4xl mb-3">💸</p>
              <p className="text-gray-500 font-medium">아직 기록된 지출이 없어요</p>
              <p className="text-gray-400 text-sm mt-1">여행 중 발생한 지출을 기록해보세요</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-5 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                지출 추가
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">분류</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">금액</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">날짜</th>
                    <th className="py-3 px-4 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      expanded={expandedId === expense.id}
                      onToggle={() => toggleExpand(expense.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <AddExpenseModal
          onClose={() => setShowModal(false)}
          onSave={addExpense}
        />
      )}
    </div>
  );
}
