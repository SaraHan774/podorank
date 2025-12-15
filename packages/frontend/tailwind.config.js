/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary (게임 강조) - 와인색
        primary: {
          500: '#D94455', // 밝은 와인색
          700: '#A91E2D', // 와인색 (메인)
          900: '#5C1D1F', // 와인색 진함
        },
        // Success (선택 완료)
        success: {
          400: '#6EE7B7',
          500: '#10B981',
        },
        // Neutral (배경, 텍스트)
        neutral: {
          50: '#FAFAFA',   // 거의 흰색
          100: '#F3F4F6',  // 밝은 회색
          200: '#E5E7EB',
          300: '#D1D5DB',
          500: '#6B7280',  // 중간 회색
          700: '#374151',  // 어두운 회색
          900: '#111827',  // 거의 검은색
        },
        // Accent (와인병, 특수 강조)
        accent: {
          gold: '#D4AF37',    // 와인 라벨 금색
          purple: '#6B3FA0',  // 포도 색상
        },
        // Semantic (상태)
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      // Typography
      fontSize: {
        // Headlines
        'display': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],  // 60px - H1 게임 제목
        'h1': ['1.875rem', { lineHeight: '1.2', fontWeight: '700' }],      // 30px - H2 섹션 제목
        'h2': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],       // 20px - H3 카드 제목
        // Body
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],  // 18px
        'body': ['1rem', { lineHeight: '1.6' }],         // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],  // 14px
      },
      // Spacing (4px base unit)
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      // Border Radius
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'full': '9999px',
      },
      // Shadows
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.1)',
      },
      // Animation
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'grape-bounce': 'grapeBounce 0.8s infinite',
      },
      keyframes: {
        grapeBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
