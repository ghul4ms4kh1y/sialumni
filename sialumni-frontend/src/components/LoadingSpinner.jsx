export default function LoadingSpinner({ text = 'Memuat data...' }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span className="spinner-text">{text}</span>
    </div>
  );
}
