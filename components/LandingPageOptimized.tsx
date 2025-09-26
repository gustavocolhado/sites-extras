'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaFire, FaPlay, FaEye, FaHeart, FaClock, FaUsers, FaVideo, FaSearch, FaCrown, FaTags, FaThLarge, FaComments, FaUpload, FaPlus, FaUserCircle, FaCheck, FaArrowRight, FaCopy, FaSpinner, FaTimes, FaUnlock, FaShieldAlt, FaMobile, FaCalendarAlt, FaHeadphones, FaChevronLeft, FaChevronRight, FaCreditCard } from 'react-icons/fa';
import Image from 'next/image';
import Container from '@/components/Container';
import QRCode from 'qrcode';
import CPATracking, { useCPAConversion } from '@/components/CPATracking';

// Otimizações implementadas:
// 1. Polling mais frequente (15s em vez de 60s)
// 2. Verificação imediata reduzida (5s em vez de 10s)
// 3. Múltiplas verificações simultâneas
// 4. Melhor tratamento de erros CPA

interface Plan {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  popular?: boolean;
  savings?: string;
}

interface PixResponse {
  id: string;
  qr_code: string;
  status: string;
  value: number;
  qr_code_base64: string | null;
  payment_id?: string;
  provider?: string;
}

export default function LandingPageOptimized() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isCPASource, triggerConversion } = useCPAConversion();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState<string | null>(null);
  const [mercadoPagoPaymentId, setMercadoPagoPaymentId] = useState<number | null>(null);
  const [referralData, setReferralData] = useState<{
    source: string;
    campaign: string;
    referrer: string;
  } | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Capturar dados da campanha da URL
  useEffect(() => {
    const captureCampaignData = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referrer = document.referrer;
      
      // Capturar parâmetros da campanha
      const source = urlParams.get('source') || urlParams.get('ref') || urlParams.get('utm_source');
      const campaign = urlParams.get('campaign') || urlParams.get('utm_campaign') || urlParams.get('xclickads');
      const referrerDomain = referrer ? new URL(referrer).hostname : null;
      
      // Se não há parâmetros na URL, usar o referrer
      const finalSource = source || referrerDomain || 'direct';
      const finalCampaign = campaign || 'organic';
      const finalReferrer = referrer || 'direct';
      
      setReferralData({
        source: finalSource,
        campaign: finalCampaign,
        referrer: finalReferrer
      });
      
      // Salvar dados da campanha no localStorage
      const campaignData = {
        source: finalSource,
        campaign: finalCampaign,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: finalReferrer,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content')
      };
      
      localStorage.setItem('campaignData', JSON.stringify(campaignData));
      
      // Salvar dados da campanha no servidor
      saveCampaignData(campaignData);
      
      console.log('📊 Campanha capturada:', {
        source: finalSource,
        campaign: finalCampaign,
        referrer: finalReferrer
      });
    };
    
    captureCampaignData();
  }, []);

  // Redirecionar usuários premium para a página inicial
  useEffect(() => {
    if (session?.user?.premium) {
      console.log('🔄 Usuário premium detectado, redirecionando para página inicial...');
      router.push('/');
    }
  }, [session, router]);

  // Processar retorno do Stripe
  useEffect(() => {
    console.log('🔍 useEffect - Processando retorno do Stripe executado');
    
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');

    console.log('📊 Parâmetros da URL:', { success, sessionId, canceled, email });

    if (success === 'true' && sessionId) {
      // Buscar email do localStorage ou usar email atual
      const storedEmail = localStorage.getItem('landingPageEmail') || email;
      
      console.log('📧 Email encontrado:', storedEmail);
      
      if (storedEmail) {
        console.log('🔄 Processando retorno do Stripe:', { sessionId, email: storedEmail });
        processStripeReturn(sessionId, storedEmail);
      } else {
        console.log('⚠️ Email não encontrado para processar retorno do Stripe');
        setError('Erro: Email não encontrado. Tente novamente.');
      }
    } else if (canceled === 'true') {
      // Usuário cancelou o pagamento
      console.log('❌ Pagamento cancelado pelo usuário');
      setError('Pagamento cancelado. Tente novamente.');
    } else {
      console.log('ℹ️ Nenhum parâmetro de retorno encontrado');
    }
  }, [email]);

  // Função para salvar dados da campanha
  const saveCampaignData = async (data: any) => {
    try {
      await fetch('/api/campaigns/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Erro ao salvar dados da campanha:', error);
    }
  };

  // Função para processar retorno do Stripe
  const processStripeReturn = async (sessionId: string, userEmail: string) => {
    try {
      console.log('🔄 Iniciando processamento do retorno do Stripe...');
      
      const response = await fetch('/api/landing-page/process-stripe-return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          email: userEmail
        }),
      });

      const data = await response.json();
      console.log('📊 Resposta do processamento:', data);

      if (response.ok) {
        console.log('✅ Payment Stripe processado com sucesso');
        
        // Definir o email atual se não estiver definido
        if (!email) {
          setEmail(userEmail);
        }
        
        // Processar tracking CPA se aplicável
        if (isCPASource && selectedPlan) {
          console.log('🎯 Processando conversão CPA para TrafficStars');
          try {
            await triggerConversion(userEmail, selectedPlan.id, selectedPlan.price / 100);
            console.log('✅ Conversão CPA registrada com sucesso');
          } catch (error) {
            console.error('❌ Erro ao registrar conversão CPA:', error);
          }
        }
        
        // Mostrar formulário de senha após processar payment
        setShowPasswordForm(true);
        setShowModal(true); // Garantir que o modal está aberto
        
        console.log('✅ Modal de senha aberto');
      } else {
        console.error('❌ Erro na resposta:', data);
        setError(data.error || 'Erro ao processar pagamento Stripe');
      }
    } catch (error) {
      console.error('❌ Erro ao processar retorno do Stripe:', error);
      setError('Erro ao processar pagamento. Tente novamente.');
    }
  };

  // OTIMIZAÇÃO 1: Polling mais frequente para PIX (15s em vez de 60s)
  useEffect(() => {
    if (showPixPayment && pixData && !paymentConfirmed) {
      // Aguardar apenas 5 segundos antes de começar o polling
      const initialDelay = setTimeout(() => {
        const pollInterval = setInterval(async () => {
          try {
            const response = await fetch('/api/landing-page/check-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pixId: pixData.id
              }),
            });

            if (response.ok) {
              const statusData = await response.json();
              if (statusData.paid && !paymentConfirmed) {
                console.log('✅ Pagamento confirmado automaticamente!');
                
                // Processar tracking CPA se aplicável
                if (isCPASource && selectedPlan) {
                  console.log('🎯 Processando conversão CPA para TrafficStars (PIX)');
                  try {
                    await triggerConversion(email, selectedPlan.id, selectedPlan.price / 100);
                    console.log('✅ Conversão CPA registrada com sucesso (PIX)');
                  } catch (error) {
                    console.error('❌ Erro ao registrar conversão CPA (PIX):', error);
                  }
                }
                
                // Pagamento confirmado! Mostrar formulário de senha
                setPaymentConfirmed(true);
                setShowPixPayment(false);
                setShowPasswordForm(true);
                clearInterval(pollInterval);
              }
            }
          } catch (error) {
            console.error('Erro ao verificar status automaticamente:', error);
          }
        }, 15000); // Verificar a cada 15 segundos (mais rápido)

        // Limpar o intervalo quando o componente for desmontado ou quando o pagamento for confirmado
        return () => clearInterval(pollInterval);
      }, 5000); // Aguardar apenas 5 segundos antes de começar

      // Limpar o timeout quando o componente for desmontado
      return () => clearTimeout(initialDelay);
    }
  }, [showPixPayment, pixData, paymentConfirmed]);

  // OTIMIZAÇÃO 2: Verificação imediata mais rápida (3s em vez de 10s)
  useEffect(() => {
    if (pixData && showPixPayment && !paymentConfirmed) {
      // Aguardar apenas 3 segundos e fazer uma verificação imediata
      const immediateCheck = setTimeout(async () => {
        try {
          const response = await fetch('/api/landing-page/check-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pixId: pixData.id
            }),
          });

          if (response.ok) {
            const statusData = await response.json();
            if (statusData.paid && !paymentConfirmed) {
              console.log('✅ Pagamento já confirmado via webhook!');
              
              // Processar tracking CPA se aplicável
              if (isCPASource && selectedPlan) {
                console.log('🎯 Processando conversão CPA para TrafficStars (PIX - Webhook)');
                try {
                  await triggerConversion(email, selectedPlan.id, selectedPlan.price / 100);
                  console.log('✅ Conversão CPA registrada com sucesso (PIX - Webhook)');
                } catch (error) {
                  console.error('❌ Erro ao registrar conversão CPA (PIX - Webhook):', error);
                }
              }
              
              setPaymentConfirmed(true);
              setShowPixPayment(false);
              setShowPasswordForm(true);
            }
          }
        } catch (error) {
          console.error('Erro na verificação imediata:', error);
        }
      }, 3000); // Aguardar apenas 3 segundos

      return () => clearTimeout(immediateCheck);
    }
  }, [pixData, showPixPayment, paymentConfirmed]);

  // OTIMIZAÇÃO 3: Polling mais frequente para MercadoPago (5s em vez de 10s)
  useEffect(() => {
    if (mercadoPagoPaymentId && !paymentConfirmed) {
      console.log('🎯 Iniciando polling automático para MercadoPago:', mercadoPagoPaymentId);
      
      // Aguardar apenas 3 segundos antes de começar o polling
      const initialDelay = setTimeout(() => {
        const pollInterval = setInterval(async () => {
          try {
            console.log('🔍 Verificando status do pagamento MercadoPago:', mercadoPagoPaymentId);
            
            const response = await fetch(`/api/mercado-pago/status?paymentId=${mercadoPagoPaymentId}`, {
              method: 'GET',
            });

            if (response.ok) {
              const statusData = await response.json();
              console.log('📊 Status do pagamento MercadoPago:', statusData);
              
              if ((statusData.status === 'approved' || statusData.status === 'paid') && !paymentConfirmed) {
                console.log('✅ Pagamento MercadoPago confirmado automaticamente!');
                
                // Processar tracking CPA se aplicável
                if (isCPASource && selectedPlan) {
                  console.log('🎯 Processando conversão CPA para TrafficStars (MercadoPago)');
                  try {
                    await triggerConversion(email, selectedPlan.id, selectedPlan.price / 100);
                    console.log('✅ Conversão CPA registrada com sucesso (MercadoPago)');
                  } catch (error) {
                    console.error('❌ Erro ao registrar conversão CPA (MercadoPago):', error);
                  }
                }
                
                // Pagamento confirmado! Mostrar formulário de senha
                setPaymentConfirmed(true);
                setShowPasswordForm(true);
                setShowModal(true);
                clearInterval(pollInterval);
              }
            } else {
              console.log('⚠️ Erro ao verificar status do pagamento MercadoPago:', response.status);
            }
          } catch (error) {
            console.error('❌ Erro ao verificar status do pagamento MercadoPago:', error);
          }
        }, 5000); // Verificar a cada 5 segundos (mais rápido)

        // Limpar o polling após 10 minutos
        setTimeout(() => {
          clearInterval(pollInterval);
          console.log('⏰ Polling do MercadoPago finalizado após 10 minutos');
        }, 10 * 60 * 1000);

        return () => clearInterval(pollInterval);
      }, 3000); // Aguardar apenas 3 segundos antes de começar

      return () => clearTimeout(initialDelay);
    }
  }, [mercadoPagoPaymentId, paymentConfirmed, isCPASource, selectedPlan, email, triggerConversion]);

  // OTIMIZAÇÃO 4: Verificação imediata mais rápida para MercadoPago (2s em vez de 5s)
  useEffect(() => {
    if (mercadoPagoPaymentId && !paymentConfirmed) {
      // Aguardar apenas 2 segundos e fazer uma verificação imediata
      const immediateCheck = setTimeout(async () => {
        try {
          console.log('🔍 Verificação imediata do pagamento MercadoPago:', mercadoPagoPaymentId);
          
          const response = await fetch(`/api/mercado-pago/status?paymentId=${mercadoPagoPaymentId}`, {
            method: 'GET',
          });

          if (response.ok) {
            const statusData = await response.json();
            console.log('📊 Status imediato do pagamento MercadoPago:', statusData);
            
            if ((statusData.status === 'approved' || statusData.status === 'paid') && !paymentConfirmed) {
              console.log('✅ Pagamento MercadoPago já confirmado via webhook!');
              
              // Processar tracking CPA se aplicável
              if (isCPASource && selectedPlan) {
                console.log('🎯 Processando conversão CPA para TrafficStars (MercadoPago - Webhook)');
                try {
                  await triggerConversion(email, selectedPlan.id, selectedPlan.price / 100);
                  console.log('✅ Conversão CPA registrada com sucesso (MercadoPago - Webhook)');
                } catch (error) {
                  console.error('❌ Erro ao registrar conversão CPA (MercadoPago - Webhook):', error);
                }
              }
              
              setPaymentConfirmed(true);
              setShowPasswordForm(true);
              setShowModal(true);
            }
          }
        } catch (error) {
          console.error('❌ Erro na verificação imediata do pagamento MercadoPago:', error);
        }
      }, 2000); // Aguardar apenas 2 segundos

      return () => clearTimeout(immediateCheck);
    }
  }, [mercadoPagoPaymentId, paymentConfirmed, isCPASource, selectedPlan, email, triggerConversion]);

  // Resto do código permanece igual...
  // (Aqui você copiaria o resto do componente original)
  
  return (
    <div className="min-h-screen bg-black flex flex-col w-full">
      <h1 className="text-white text-center py-8">Landing Page Otimizada</h1>
      <p className="text-white text-center">Sistema otimizado para detecção mais rápida de pagamentos</p>
    </div>
  );
}
