import React, { useMemo } from 'react';
import styles from './AIAnalysis.module.css';
import { analyzeStudyPatterns } from '../utils/aiAnalysis.js';

const TREND_ICONS = { improving: '📈', declining: '📉', stable: '➡️' };
const TREND_COLORS = { improving: '#06d6a0', declining: '#e94560', stable: '#ffd166' };

function MiniBarChart({ data, labels, color }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div className={styles.barChart} aria-label="Hourly study distribution chart">
      {data.map((val, i) => (
        <div key={i} className={styles.barWrapper} title={`${labels[i]}: ${val}min`}>
          <div
            className={styles.bar}
            style={{
              height: `${Math.max(2, (val / max) * 60)}px`,
              background: val > 0 ? color : 'rgba(255,255,255,0.05)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function DailyChart({ daily }) {
  if (!daily || daily.length === 0) return null;
  const max = Math.max(...daily.map((d) => d.totalMinutes), 1);
  return (
    <div className={styles.dailyChart} aria-label="Daily study time chart">
      {daily.map((d) => (
        <div key={d.date} className={styles.dayBar} title={`${d.date}: ${d.totalMinutes}min`}>
          <div
            className={styles.dayFill}
            style={{ height: `${Math.max(2, (d.totalMinutes / max) * 50)}px` }}
          />
          <span className={styles.dayLabel}>{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AIAnalysis({ sessions, stats }) {
  const analysis = useMemo(
    () => analyzeStudyPatterns(sessions, stats),
    [sessions, stats],
  );

  if (!analysis.ready) {
    return (
      <div className={`card ${styles.placeholder}`}>
        <div className={styles.placeholderIcon}>🤖</div>
        <p className={styles.placeholderText}>{analysis.message}</p>
      </div>
    );
  }

  const {
    consistencyScore,
    trend,
    period,
    top3Hours,
    avgDailyMinutes,
    avgSessionLength,
    milestoneEst,
    recommendations,
    dailyBreakdown,
    hourlyDist,
    hourLabels,
  } = analysis;

  return (
    <div className={`card ${styles.container}`}>
      <div className={styles.aiHeader}>
        <span className={styles.aiBadge}>🤖 AI</span>
        <h3>Study Pattern Analysis</h3>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpi}>
          <div
            className={styles.scoreRing}
            style={{ '--score': `${consistencyScore}%`, '--color': consistencyScore >= 70 ? '#06d6a0' : consistencyScore >= 40 ? '#ffd166' : '#e94560' }}
          >
            <span className={styles.scoreValue}>{consistencyScore}</span>
          </div>
          <span className={styles.kpiLabel}>Consistency</span>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ color: TREND_COLORS[trend] }}>
            {TREND_ICONS[trend]}
          </div>
          <span className={styles.kpiLabel} style={{ color: TREND_COLORS[trend], textTransform: 'capitalize' }}>
            {trend}
          </span>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiNumber}>{avgDailyMinutes}<span className={styles.kpiUnit}>m</span></div>
          <span className={styles.kpiLabel}>Avg/Day</span>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiNumber}>{avgSessionLength}<span className={styles.kpiUnit}>m</span></div>
          <span className={styles.kpiLabel}>Avg Session</span>
        </div>
      </div>

      {/* Profile */}
      <div className={styles.profileTag}>
        You are a <strong>{period}</strong>
        {top3Hours.length > 0 && (
          <> — most productive around <strong>{top3Hours[0].label}</strong></>
        )}
      </div>

      {/* Hourly heatmap */}
      {hourlyDist && (
        <div className={styles.chartSection}>
          <div className={styles.chartTitle}>Study Hours Heatmap (all time)</div>
          <MiniBarChart data={hourlyDist} labels={hourLabels} color="#e94560" />
        </div>
      )}

      {/* Daily trend chart */}
      {dailyBreakdown && dailyBreakdown.length > 0 && (
        <div className={styles.chartSection}>
          <div className={styles.chartTitle}>Last 14 Days</div>
          <DailyChart daily={dailyBreakdown} />
        </div>
      )}

      {/* Milestone estimate */}
      {milestoneEst && (
        <div className={styles.milestone}>
          🎯 At your current pace, you'll reach <strong>{milestoneEst.hours}h total</strong> in
          about <strong>{milestoneEst.days} day{milestoneEst.days !== 1 ? 's' : ''}</strong>!
        </div>
      )}

      {/* Recommendations */}
      <div className={styles.recSection}>
        <div className={styles.chartTitle}>Personalized Recommendations</div>
        <ul className={styles.recList}>
          {recommendations.map((r, i) => (
            <li key={i} className={styles.recItem}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
