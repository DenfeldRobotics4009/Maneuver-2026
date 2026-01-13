export function StatusBarSpacer() {
  return (
    <div 
      className="w-full bg-background"
      style={{
        height: 'env(safe-area-inset-top)',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    />
  );
}