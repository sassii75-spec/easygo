'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Simulator() {
  const [step, setStep] = useState(1);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handleAnalyze = () => {
    setIsAnalyzed(true);
    // Pre-loading text transition
    setTimeout(() => setStep(3), 2000);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
      <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>&larr; 홈으로 돌아가기</Link>
      
      <div className="glass-card my-md" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>AI 이사 시뮬레이터</h2>
          <p className="text-muted">우리 동네 이사 비용을 단 10초만에 알아보세요.</p>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-md fade-in">
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>출발지 동네</label>
              <input type="text" placeholder="예: 강남구 역삼동" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #e5e7eb', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>도착지 동네</label>
              <input type="text" placeholder="예: 송파구 잠실동" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #e5e7eb', outline: 'none' }} />
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={handleNext}>다음 단계로</button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-md fade-in">
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>주거 형태</label>
              <select style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #e5e7eb', outline: 'none', background: 'white' }}>
                <option>아파트/주상복합</option>
                <option>빌라/주택</option>
                <option>오피스텔</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>방 개수 (침실 수)</label>
              <select style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #e5e7eb', outline: 'none', background: 'white' }}>
                <option>원룸</option>
                <option>투룸</option>
                <option>3룸 이상</option>
              </select>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={handleAnalyze} disabled={isAnalyzed}>
              {isAnalyzed ? 'AI가 분석 중입니다... ⚙️' : '결과 확인하기'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center fade-in">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>분석이 완료되었습니다!</h3>
            
            <div style={{ background: 'var(--color-bg-base)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1.5rem', textAlign: 'left', border: '1px solid #e5e7eb' }}>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>예상 기본 이사 비용</span>
                <strong style={{ fontSize: '1.125rem' }}>약 850,000원</strong>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#ef4444' }}>
                <span>평균 사다리차 추가 비용</span>
                <strong style={{ fontSize: '1.125rem' }}>+ 120,000원</strong>
              </p>
              <hr style={{ border: 'none', borderTop: '1px dashed #d1d5db', margin: '1rem 0' }} />
              <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.125rem' }}>총 예상 비용</strong>
                <strong style={{ color: 'var(--color-primary-dark)', fontSize: '1.5rem' }}>약 970,000원</strong>
              </p>
            </div>

            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '1.5rem', textAlign: 'left', color: '#92400e' }}>
              💡 <strong>동네 꿀팁:</strong> 역삼동 아파트는 사다리차 진입이 어려운 단지가 많아 엘리베이터 이사 비율이 높습니다. 정확한 견적을 위해 추가 컨설팅을 받아보세요!
            </div>

            <Link href="/estimate">
              <button className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Easy AI이사견적으로 정확하게 분석하기</button>
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
