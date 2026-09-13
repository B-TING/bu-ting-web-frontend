export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-400">
      <div className="max-w-screen-md mx-auto px-6 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex w-8 h-8 items-center justify-center bg-blue-500 rounded-lg">
                <span className="text-white font-bold text-xs">부팅</span>
              </div>
              <span className="text-white font-semibold text-lg">부팅</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              부산 지역 특화 여행 계획 서비스.
              <br />짐 보관부터 축제 일정까지, 부산 여행의 모든 것.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-800 text-xs text-gray-600">
            © 2026 부팅. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
