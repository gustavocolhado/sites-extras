import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { User } from '@/types/common'
import {
  User as UserIcon, Mail, Shield, Crown, Calendar, CreditCard, QrCode, Link, Key, Clock, Hash,
  Tag, Gift, TrendingUp, CheckCircle, XCircle, Info, Globe
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext' // Importar useTheme

interface ViewUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

const DetailItem = ({ icon: Icon, label, value, breakAll = false }: { icon: React.ElementType, label: string, value: string | number | boolean | null | undefined, breakAll?: boolean }) => {
  const { theme } = useTheme() // Usar o tema aqui
  return (
    <div className="flex items-start gap-2">
      <Icon className={`w-4 h-4 mt-1 flex-shrink-0 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
      <div className="flex-1">
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>{label}: </span>
        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${breakAll ? 'break-all' : ''}`}>
          {value !== null && value !== undefined && value !== '' ? String(value) : 'N/A'}
        </span>
      </div>
    </div>
  )
}

export default function ViewUserModal({ user, isOpen, onClose }: ViewUserModalProps) {
  if (!user) return null

  const { theme } = useTheme() // Usar o tema aqui

  const formatDate = (date: Date | null | undefined) => {
    return date ? new Date(date).toLocaleDateString('pt-BR') : 'N/A'
  }

  const formatBoolean = (value: boolean | null | undefined) => {
    return value ? 'Sim' : 'Não'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Detalhes do Usuário</DialogTitle>
          <DialogDescription className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Visualize todas as informações detalhadas do usuário.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Informações Básicas */}
          <div className="space-y-3">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} pb-2 mb-3`}>Informações Básicas</h3>
            <DetailItem icon={Hash} label="ID" value={user.id} breakAll />
            <DetailItem icon={UserIcon} label="Nome" value={user.name} />
            <DetailItem icon={UserIcon} label="Username" value={user.username} />
            <DetailItem icon={Mail} label="Email" value={user.email} />
            <DetailItem icon={CheckCircle} label="Email Verificado" value={formatBoolean(user.emailVerified !== null)} />
            <DetailItem icon={Shield} label="Acesso" value={user.access === 1 ? 'Administrador' : user.access} />
            <DetailItem icon={Crown} label="Premium" value={formatBoolean(user.premium)} />
            <DetailItem icon={Calendar} label="Criado em" value={formatDate(user.created_at)} />
            <DetailItem icon={Clock} label="Última Atualização" value={formatDate(user.update_at)} />
            <DetailItem icon={Globe} label="Fonte de Cadastro" value={user.signupSource} />
          </div>

          {/* Detalhes de Pagamento */}
          <div className="space-y-3">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} pb-2 mb-3`}>Detalhes de Pagamento</h3>
            <DetailItem icon={CreditCard} label="ID Pagamento" value={user.paymentId} />
            <DetailItem icon={Tag} label="ID Preferência" value={user.preferenceId} />
            <DetailItem icon={QrCode} label="URL QR Code Pagamento" value={user.paymentQrCodeUrl} breakAll />
            <DetailItem icon={Info} label="Status Pagamento" value={user.paymentStatus} />
            <DetailItem icon={CreditCard} label="Tipo Pagamento" value={user.paymentType} />
            <DetailItem icon={Calendar} label="Data Pagamento" value={formatDate(user.paymentDate)} />
            <DetailItem icon={Calendar} label="Data Expiração" value={formatDate(user.expireDate)} />
            <DetailItem icon={Key} label="Chave Pix" value={user.chavePix} />
            <DetailItem icon={TrendingUp} label="Pagamento por Campanha" value={formatBoolean(user.isCampaignPayment)} />
          </div>

          {/* Detalhes de Afiliação e Promoção */}
          <div className="space-y-3 md:col-span-2">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} pb-2 mb-3`}>Afiliação e Promoção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailItem icon={Link} label="ID Afiliado" value={user.affiliateId} breakAll />
              <DetailItem icon={Gift} label="ID Promoção" value={user.promotionId} breakAll />
              <DetailItem icon={Tag} label="Código Promocional" value={user.promotionCode} />
            </div>
          </div>

          {/* Configurações de Conta */}
          <div className="space-y-3 md:col-span-2">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} pb-2 mb-3`}>Configurações de Conta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailItem icon={XCircle} label="Senha Temporária" value={formatBoolean(user.tempPassword)} />
              <DetailItem icon={Info} label="Precisa Mudar Senha" value={formatBoolean(user.needsPasswordChange)} />
              <DetailItem icon={Mail} label="Aceita Emails Promocionais" value={formatBoolean(user.acceptPromotionalEmails)} />
              <DetailItem icon={CheckCircle} label="Aceita Termos de Uso" value={formatBoolean(user.acceptTermsOfUse)} />
              <DetailItem icon={Clock} label="Último Email Enviado" value={formatDate(user.lastEmailSent)} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
