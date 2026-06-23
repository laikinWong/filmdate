export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-handwritten text-primary-dark mb-4">
          FilmDate
        </h1>
        <p className="text-xl text-primary-dark/60 mb-8">
          用复古胶片记录你们的爱情故事
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/auth/signup"
            className="btn-retro inline-block"
          >
            开始你们的故事
          </a>
          <a
            href="/auth/login"
            className="inline-block px-6 py-3 border-2 border-primary-dark text-primary-dark rounded-lg hover:bg-primary-dark hover:text-primary-light transition-colors"
          >
            登录
          </a>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
        <div className="text-center p-6 bg-primary-dark/5 rounded-xl animate-float">
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-lg font-handwritten text-primary-dark mb-2">每日挑战</h3>
          <p className="text-sm text-primary-dark/60">每天一个主题，两人分别拍照回应</p>
        </div>
        <div className="text-center p-6 bg-primary-dark/5 rounded-xl animate-float" style={{ animationDelay: '1s' }}>
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-lg font-handwritten text-primary-dark mb-2">拼贴编辑</h3>
          <p className="text-sm text-primary-dark/60">复古胶片风格的创意拼贴工具</p>
        </div>
        <div className="text-center p-6 bg-primary-dark/5 rounded-xl animate-float" style={{ animationDelay: '2s' }}>
          <div className="text-4xl mb-4">📸</div>
          <h3 className="text-lg font-handwritten text-primary-dark mb-2">回忆墙</h3>
          <p className="text-sm text-primary-dark/60">时间线形式回顾美好瞬间</p>
        </div>
      </div>
    </div>
  );
}
