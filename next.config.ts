import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true, // Игнорировать ESLint во время сборки
	},
}

export default nextConfig
