import { getServerSession } from 'next-auth'
import { authOptions } from './auth.config'

export const getAuthSession = () => getServerSession(authOptions)