// Configuração centralizada de cores do site
// Este arquivo define todas as cores utilizadas no projeto

export const colors = {
  // Cores principais do tema
  primary: {
    red: '#dc2626',
    redHover: '#b91c1c',
    redLight: '#ef4444',
    redDark: '#991b1b'
  },

  // Cores do tema dark
  dark: {
    bg: '#0f0f0f',           // Background mais escuro
    card: '#1a1a1a',         // Cards mais escuros
    hover: '#2a2a2a',        // Hover mais suave
    border: '#333333',       // Bordas mais suaves
    text: {
      primary: '#ffffff',    // Texto principal branco
      secondary: '#b3b3b3',  // Texto secundário mais claro
      muted: '#808080'       // Texto muted mais visível
    }
  },

  // Cores do tema light
  light: {
    bg: '#ffffff',           // Background branco puro
    card: '#f8f9fa',         // Cards com tom cinza muito claro
    hover: '#e9ecef',        // Hover mais contrastante
    border: '#dee2e6',       // Bordas mais definidas
    text: {
      primary: '#212529',    // Texto principal mais escuro
      secondary: '#495057',  // Texto secundário mais escuro
      muted: '#6c757d'       // Texto muted mais legível
    }
  },

  // Cores de status
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },

  // Cores de gradiente
  gradients: {
    red: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    dark: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    light: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  },

  // Cores de overlay
  overlay: {
    dark: 'rgba(0, 0, 0, 0.75)',
    light: 'rgba(255, 255, 255, 0.75)',
    red: 'rgba(220, 38, 38, 0.1)'
  }
}

// Classes CSS para uso com Tailwind
export const colorClasses = {
  // Backgrounds
  bg: {
    primary: 'bg-accent-red',
    primaryHover: 'hover:bg-accent-red-hover',
    dark: 'dark:bg-dark-bg',
    light: 'bg-light-bg',
    darkCard: 'dark:bg-dark-card',
    lightCard: 'bg-light-card',
    darkHover: 'dark:bg-dark-hover',
    lightHover: 'bg-light-hover'
  },

  // Textos
  text: {
    darkPrimary: 'dark:text-white',
    lightPrimary: 'text-black',
    darkSecondary: 'dark:text-gray-300',
    lightSecondary: 'text-gray-600',
    darkMuted: 'dark:text-gray-400',
    lightMuted: 'text-gray-500',
    primary: 'text-accent-red',
    primaryHover: 'hover:text-accent-red-hover'
  },

  // Bordas
  border: {
    dark: 'dark:border-gray-600',
    light: 'border-gray-200',
    darkHover: 'hover:dark:border-gray-500',
    lightHover: 'hover:border-gray-300'
  },

  // Estados
  states: {
    hover: {
      dark: 'hover:dark:text-white hover:text-gray-800',
      light: 'hover:text-gray-800',
      primary: 'hover:text-accent-red'
    },
    focus: {
      dark: 'focus:dark:ring-accent-red focus:ring-2',
      light: 'focus:ring-accent-red focus:ring-2'
    }
  }
}

// Função para obter cor baseada no tema
export const getThemeColor = (theme: 'dark' | 'light', type: 'bg' | 'text' | 'border') => {
  const themeColors = theme === 'dark' ? colors.dark : colors.light
  
  switch (type) {
    case 'bg':
      return themeColors.bg
    case 'text':
      return themeColors.text.primary
    case 'border':
      return themeColors.border
    default:
      return themeColors.bg
  }
}

// Função para obter classes CSS baseadas no tema
export const getThemeClasses = (component: string) => {
  const classMap = {
    header: {
      bg: 'dark:bg-gray-800 bg-white',
      border: 'border-b dark:border-gray-600 border-gray-200',
      text: 'dark:text-white text-gray-800'
    },
    card: {
      bg: 'dark:bg-dark-card bg-white',
      border: 'border dark:border-gray-700 border-gray-200',
      text: 'dark:text-white text-black'
    },
    button: {
      primary: 'bg-accent-red hover:bg-accent-red-hover text-white',
      secondary: 'dark:bg-gray-700 bg-gray-200 hover:dark:bg-gray-600 hover:bg-gray-300',
      outline: 'border dark:border-gray-600 border-gray-300 hover:dark:border-gray-500 hover:border-gray-400'
    },
    input: {
      bg: 'dark:bg-gray-700 bg-gray-100',
      border: 'border-l dark:border-gray-600 border-gray-300',
      text: 'dark:text-white text-gray-800',
      placeholder: 'dark:placeholder-gray-400 placeholder-gray-500'
    }
  }

  return classMap[component as keyof typeof classMap] || {}
}

// Exportação padrão
export default colors 