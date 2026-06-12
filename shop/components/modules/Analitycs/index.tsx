import GoogleAnalitycs from "./GoogleAnalytics/GoogleAnalytics"

export const AnalyticScripts = () => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID
    return (
        <>{Boolean(gaId) && <GoogleAnalitycs id={gaId || ''} />}</>

    )
}