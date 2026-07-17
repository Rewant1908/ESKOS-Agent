'use client';

export default function TrustScoreBadge({ score = 50 }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 85 ? '#00d4aa' : score >= 70 ? '#6c63ff' : score >= 50 ? '#ffa94d' : '#ff6b6b';

  return (
    <div className="trust-ring" title={`Trust Score: ${score}/100`}>
      <svg viewBox="0 0 52 52">
        <circle className="track" cx="26" cy="26" r={radius} />
        <circle
          className="fill"
          cx="26" cy="26" r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="trust-score-label" style={{ color }}>
        {Math.round(score)}
      </div>
    </div>
  );
}
