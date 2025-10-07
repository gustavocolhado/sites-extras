'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { AlertTriangle } from 'lucide-react';

interface DeletionSummary {
  comments: number;
  likes: number;
  favorites: number;
  history: number;
  payments: number;
  affiliateSales: number;
  affiliateReferred: number;
  withdrawalRequests: number;
  campaignConversions: number;
  paymentSessions: number;
  emailLinks: number;
  emailClicks: number;
  emailConversions: number;
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary: DeletionSummary | null;
  userName: string;
}

const summaryLabels: { [key in keyof DeletionSummary]: string } = {
  comments: 'Comentários',
  likes: 'Curtidas',
  favorites: 'Favoritos',
  history: 'Histórico',
  payments: 'Pagamentos',
  affiliateSales: 'Vendas de Afiliado',
  affiliateReferred: 'Indicações de Afiliado',
  withdrawalRequests: 'Pedidos de Saque',
  campaignConversions: 'Conversões de Campanha',
  paymentSessions: 'Sessões de Pagamento',
  emailLinks: 'Links de Email',
  emailClicks: 'Cliques de Email',
  emailConversions: 'Conversões de Email',
};

export default function DeleteUserModal({ isOpen, onClose, onConfirm, summary, userName }: DeleteUserModalProps) {
  if (!isOpen) return null;

  const summaryItems = summary 
    ? Object.entries(summary)
        .filter(([, value]) => value > 0)
        .map(([key, value]) => ({
          label: summaryLabels[key as keyof DeletionSummary],
          value,
        }))
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" placement="center">
      <ModalContent className="bg-white rounded-lg shadow-xl">
        <ModalHeader className="flex items-center gap-2 border-b border-slate-200 p-4">
          <AlertTriangle className="text-red-500" />
          <span className="text-lg font-semibold text-slate-800">Confirmar Exclusão</span>
        </ModalHeader>
        <ModalBody className="p-6">
          <p className="text-slate-600">
            Tem certeza que deseja excluir o usuário <strong className="text-slate-900">{userName}</strong>?
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Esta ação é irreversível e todos os dados associados serão permanentemente removidos.
          </p>
          {summaryItems.length > 0 && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-700 mb-2">Os seguintes registros serão excluídos:</h4>
              <ul className="space-y-1 text-sm text-slate-600 max-h-40 overflow-y-auto">
                {summaryItems.map(({ label, value }) => (
                  <li key={label} className="flex justify-between items-center">
                    <span>{label}:</span>
                    <span className="font-bold text-slate-800 bg-slate-200 rounded-full px-2 py-0.5 text-xs">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-lg">
          <Button color="default" variant="light" onClick={onClose} className="text-slate-700 hover:bg-slate-200">
            Cancelar
          </Button>
          <Button color="danger" onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
            Excluir Permanentemente
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
