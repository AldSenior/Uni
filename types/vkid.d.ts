declare global {
	interface Window {
		VKIDSDK: {
			Config: {
				init: (config: {
					app: number
					redirectUrl: string
					responseMode: 'callback' | 'direct'
					source: 'lowcode' | 'highcode'
					scope?: string
				}) => void
				ResponseMode: {
					Callback: 'callback'
					Direct: 'direct'
				}
				Source: {
					LOWCODE: 'lowcode'
					HIGHCODE: 'highcode'
				}
			}
			OneTap: new () => {
				render: (options: {
					container: HTMLElement
					showAlternativeLogin?: boolean
				}) => {
					on: (event: string, callback: (payload: any) => void) => void
				}
				destroy: () => void
			}
			Auth: {
				exchangeCode: (
					code: string,
					deviceId: string
				) => Promise<{
					access_token: string
					user_id: number
					expires_in: number
				}>
			}
			WidgetEvents: {
				ERROR: string
			}
			OneTapInternalEvents: {
				LOGIN_SUCCESS: string
			}
		}
	}
}
