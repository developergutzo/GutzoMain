# Legacy Code Memory

## LocationBottomSheet.tsx - Coimbatore Availability Check

Removed on: 2025-12-20 Reason: User requested removal but wanted to keep it for
reference.

```tsx
{
    !isInCoimbatore && !isLoading && !error && (
        <div
            className="text-xs mt-2 px-2 py-1 rounded-[0.8rem] inline-block"
            style={{ color: colors.warning, background: "#FFF7E6" }}
        >
            Service currently available only in Coimbatore
        </div>
    );
}
```

## App.tsx - Location Gate Trigger

Found in older version, preserved for reference.

```tsx
useEffect(() => {
    //if (!locationLoading && !isInCoimbatore) {
    if (false) {
        const timer = setTimeout(() => {
            setShowLocationGate(true);
        }, 2000);
        return () => clearTimeout(timer);
    }
}, [locationLoading, isInCoimbatore]);
```
