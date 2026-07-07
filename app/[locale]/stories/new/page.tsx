'use client';

import { ArrowLeft, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const QUICK_TAGS = ['#맛집', '#뷰맛집', '#사진스팟', '#힐링', '#가족', '#데이트', '#재방문', '#추천'];

export default function StoryNewPage() {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['#사진스팟', '#추천']);
  const [customTag, setCustomTag] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  const previewTags = useMemo(() => selectedTags.slice(0, 6), [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();

    if (!trimmed) {
      return;
    }

    const normalizedTag = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

    setSelectedTags((currentTags) =>
      currentTags.includes(normalizedTag) ? currentTags : [...currentTags, normalizedTag],
    );
    setCustomTag('');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-5 sm:px-6">
          <Link
            href="/stories"
            aria-label="여행기 목록으로 돌아가기"
            className="flex size-10 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-50"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div>
            <p className="text-sm font-semibold text-sky-700">Review Writer</p>
            <h1 className="text-3xl font-black text-slate-950">여행지 후기 남기기</h1>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_0.9fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">장소</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">해운대 해수욕장</h2>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-500">평점</p>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="rounded-full p-1 transition hover:bg-amber-50"
                  aria-label={`${star}점 선택`}
                >
                  <Star
                    className={[
                      'size-8',
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300',
                    ].join(' ')}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-500">태그</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={[
                      'rounded-full px-3 py-2 text-sm font-semibold transition',
                      isSelected
                        ? 'bg-sky-700 text-white'
                        : 'bg-sky-50 text-sky-700 hover:bg-sky-100',
                    ].join(' ')}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                placeholder="태그 입력 후 추가"
                className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-700 px-4 text-white transition hover:bg-sky-800"
                aria-label="태그 추가"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-500">코멘트</p>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="이곳에서의 경험을 남겨 주세요."
              className="mt-3 min-h-44 w-full rounded-3xl border border-slate-200 px-4 py-4 text-sm leading-7 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-500"
            >
              사진 추가
            </button>
            <button
              type="button"
              className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-500"
            >
              영상 추가
            </button>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Link
              href="/stories"
              className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              취소
            </Link>
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="rounded-2xl bg-sky-700 px-5 py-3 font-semibold text-white transition hover:bg-sky-800"
            >
              저장
            </button>
          </div>
        </article>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-sky-700">Preview</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">작성 미리보기</h2>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-400">평점</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{rating.toFixed(1)} / 5.0</p>

            <p className="mt-5 text-sm text-slate-400">선택한 태그</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {previewTags.length > 0 ? (
                previewTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-sky-700">
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">아직 선택한 태그가 없어요.</p>
              )}
            </div>

            <p className="mt-5 text-sm text-slate-400">후기 내용</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {content.trim() || '작성한 후기가 여기에 미리 보여요.'}
            </p>
          </div>

          {saved ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700">
              저장 버튼을 눌렀어요. 실제 업로드 연동 전까지는 여기서 작성 상태만 확인할 수 있어요.
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
