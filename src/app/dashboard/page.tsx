"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setUser(localStorage.getItem('easygo_user') || '고객');
    const stored = JSON.parse(localStorage.getItem('easygo_history') || '[]');
    setHistory(stored);
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', background: '#f8fafc', paddingBottom: '3rem' }}>
      <header style={{ background: 'var(--color-primary)', color: 'white', padding: '1.5rem', borderBottomLeftRadius: 'var(--border-radius-lg)', borderBottomRightRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>🏠 이지고 마이 보드</h1>
        <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>{user}님의 이사 시뮬레이션 및 스케줄 내역</p>
      </header>

      <main style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>내 견적 기록</h2>
          <a href="/" style={{ background: '#e2e8f0', color: '#475569', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>+ 새 견적받기</a>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 'var(--border-radius-md)', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>아직 저장된 견적 내역이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((h: any) => (
              <div key={h.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative' }}>
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{new Date(h.date).toLocaleString()}</div>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    📦 {h.truckTons}톤 트럭 (총 짐량)
                 </h3>
                 
                 <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: '#475569' }}>최종 예상 결제액</span>
                      <strong style={{ color: '#2563eb' }}>{h.finalCostMin}~{h.finalCostMax}만원</strong>
                    </div>
                    {h.savedAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#94a3b8' }}>중고 판매 세이브액</span>
                        <strong style={{ color: '#d97706' }}>-{h.savedAmount}만원</strong>
                      </div>
                    )}
                 </div>

                 <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px', fontWeight: 600 }}>포장이사 기준</span>
                    {h.addonsActive && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#fce7f3', color: '#be185d', borderRadius: '4px', fontWeight: 600 }}>부대비용 포함</span>}
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#ecfccb', color: '#4d7c0f', borderRadius: '4px', fontWeight: 600 }}>보관 물품 {h.itemsCount}개</span>
                 </div>

                 <button onClick={() => alert('상세 일정 및 업체 배정 기능은 개발 중입니다.')} style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', background: '#111827', color: '#fff', borderRadius: 'var(--border-radius-sm)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                   상세 일정 및 계약 관리
                 </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
