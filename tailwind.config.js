/** @type {import('tailwindcss').Config} */
import withMT from '@material-tailwind/react/utils/withMT';

export default withMT({
  content: ['./src/index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    colors: {
      'slate-800': 'rgb(30 41 59)',
      'slate-900': 'rgb(15 23 42)',
      'slate-700': 'rgb(51 65 85)',
      'slate-600': 'rgb(71 85 105)',
      'slate-500': 'rgb(100 116 139)',
      'slate-400': 'rgb(156 163 175)',
      'slate-300': 'rgb(209 213 219)',
      'slate-200': 'rgb(229 231 235)',
      'slate-100': 'rgb(243 244 246)',
      'slate-50': 'rgb(249 250 251)'
    }
  },
  variants: {
    extend: {},
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui']
    }
  },
  plugins: []
});
