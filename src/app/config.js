// export const authVK = {
// 	appId: '<53263292>', //
// 	scope: ['email, message'], // список разрешений, например email
// 	secret: '<xK4loxyZGbRjhC7OjBw2>', // секретный ключ приложения
// }

const VKConfig = {
	appId: '53263292', // Ваш идентификатор приложения
	scope: ['offline'], // Список разрешений, например 'offline' для получения длительных токенов
	version: '5.131', // Версия API VK
}

export { VKConfig }
