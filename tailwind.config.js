/** @type {import('tailwindcss').Config} */

const distributorCode = process.env.NEXT_PUBLIC_DISTRIBUTOR_ID || 'default';

const getDistributorTheme = (distributor) => {
  const distributorId = distributor && distributor.toLowerCase();
  switch (distributorId) {
    case 'onesb':
      return {
        'primary-white': "#f1f5f9",
        'sidebar-bg': '#a09eef',
        'light-gray': '#919191',
        'light-red': '#CE5151',
        'light-blue': '#3B39D9',
        'primary-green': '#65A30D',
        'light-orange': '#F57C00',
        'dark-gray': "#f1f5f9",
        'chalk-blue': "#CCE6FF",
        'semi-orange': "#FCA714",
        'old-lace': "#FCF6EC",
        'fd-primary': "#3b39d9",
        'background-primary': '#F7F8FA',
        'background-secondary': "#3b39d9",
        'hover-primary': "#1A1B1C",
        'footer-primary': "#a3a3a345",
        'brand-start':"#3b39d9",
        'brand-end':"#3b39d9 ",
        'shadow': '#47bfdc66',
        'backgred1' :'#f7f8fa',
        'backgred2' : '#f7f8fa',
        'heading-color' :'#122232',
        'cardheader1':'#f1f5f9',
        'cardheader2' :'#f1f5f9',
        'popupback':'#09111acc',
        'subcontent':'#98a6b3'
      };
    case "hdfcsecl":
      return {
        'primary-white': "#FFFFFF",
        'sidebar-bg': '#a09eef',

        'light-gray': '#919191',
        'light-red': '#F04438',
        'light-blue': '#3B39D9',
        'primary-green': '#028737',
        'light-orange': '#F57C00',
        'dark-gray': "#f7f8fa",
        'chalk-blue': "#CCE6FF",
        'semi-orange': "#FCA714",
        'old-lace': "#FCF6EC",
        'fd-primary': "#2850E7",
        'hover-primary': "#364682",
        'background-primary': '#E3E9FC',
        'background-secondary': "#E3E9FC",
        'footer-primary': "#a3a3a345",
        'brand-start':"#3b39d9",
        'brand-end':"#3b39d9 ",
        'shadow': '#47bfdc66',
        'backgred1' :'#f7f8fa',
        'backgred2' : '#f7f8fa',
        'heading-color' :'#122232',
        'cardheader1':'#f1f5f9',
        'cardheader2' :'#f1f5f9',
        'popupback':'#09111acc',
        'subcontent':'#98a6b3'
        
      };
    case 'tipson':
      return {
        'primary-white': "#FFFFFF",
        'sidebar-bg': '#63773b',

        'light-gray': '#919191',
        'light-red': '#3E521F',
        'light-blue': '#3B39D9',
        'primary-green': '#9CBF59',
        'light-orange': '#F57C00',
        'dark-gray': "#CBCBCB",
        'chalk-blue': "#CCE6FF",
        'semi-orange': "#FCA714",
        'old-lace': "#FCF6EC",
        'fd-primary': "#3E521F",
        'background-primary': '#FBFCF5',
        'background-secondary': "#D1DDB9",
        'hover-primary': "#63773b",
        'footer-primary': "#a3a3a345",
        'brand-start':"#3E521F",
        'brand-end':"#3E521F ",
        'shadow': '#47bfdc66',
        'backgred1' :'#f7f8fa',
        'backgred2' : '#f7f8fa',
        'heading-color' :'#122232',
        'cardheader1':'#f1f5f9',
        'cardheader2' :'#f1f5f9',
        'popupback':'#09111acc',
        'subcontent':'#98a6b3'
      };
      case 'axis':
      return {
        'primary-white': "#FFFFFF",
        'sidebar-bg': '#ed1164',
        'light-gray': '#919191',
        'light-red': '#CE5151',
        'light-blue': '#97144D',
        'primary-green': '#ED1164',
        'light-orange': '#F57C00',
        'dark-gray': "#CBCBCB",
        'chalk-blue': "#CCE6FF",
        'semi-orange': "#FCA714",
        'old-lace': "#FCF6EC",
        'fd-primary': "#97144D",
        'background-primary': '#F7F8FA',
        'background-secondary': "#ED1164",
        'hover-primary': "#1A1B1C",
        'footer-primary': "#a3a3a345",
        'brand-start':"#97144D",
        'brand-end':"#97144D ",
        'shadow': '#47bfdc66',
        'backgred1' :'#f7f8fa',
        'backgred2' : '#f7f8fa',
        'heading-color' :'#122232',
        'cardheader1':'#f1f5f9',
        'cardheader2' :'#f1f5f9',
        'popupback':'#09111acc',
        'subcontent':'#98a6b3'
      };
      case 'arathi':
        return {
          'primary-white': "#FFFFFF",
          'sidebar-bg': '#FAA307',
          'light-gray': '#919191',
          'light-red': '#CE5151',
          'light-blue': '#D2AE6D',
          'primary-green': '#D2AE6D',
          'light-orange': '#F57C00',
          'dark-gray': "#CBCBCB",
          'chalk-blue': "#CCE6FF",
          'semi-orange': "#FCA714",
          'old-lace': "#FCF6EC",
          'fd-primary': "#D2AE6D",
          'background-primary': '#F7F8FA',
          'background-secondary': "#D2AE6D",
          'hover-primary': "#1A1B1C",
          'footer-primary': "#ef830452",
          'brand-start':"#5D6634",
          'brand-end':"#5D6634 ",
          'shadow': '#47bfdc66',
          'backgred1' :'#f7f8fa',
          'backgred2' : '#f7f8fa',
          'heading-color' :'#122232',
          'cardheader1':'#f1f5f9',
          'cardheader2' :'#f1f5f9',
          'popupback':'#09111acc',
          'subcontent':'#98a6b3'
        };
      case 'northarc':
      return {
        'primary-white': "#f1f4f8",
        'sidebar-bg': 'rgb(79 198 223)',
        'light-gray': '#1a204b',
        'light-red': '#CE5151',
        'light-blue': 'rgb(74 200 224)',
        'primary-green': '#00b2ff',
        'light-orange': '#F57C00',
        'dark-gray': "#f1f4f8",
        'chalk-blue': "#CCE6FF",
        'semi-orange': "#FCA714",
        'old-lace': "#FCF6EC",
        'fd-primary': "rgb(74 200 224)",
        'background-primary': '#F7F8FA',
        'background-secondary': "rgb(79 198 223)",
        'hover-primary': "#00B2FF",
        'footer-primary': "#4fc6df33",
        'brand-start':"#6ed98c",
        'brand-end':"#36b4ff ",
        'shadow': '#47bfdc66',
        'backgred1' :'#cac6ed',
        'backgred2' : '#d8f3f2',
        'heading-color' :'#122232',
        'cardheader1':'#dee4ffb3',
        'cardheader2' :'#bec6ecd6',
        'popupback':'#09111acc',
        'subcontent':'#98a6b3'

        
      };
      case 'TATACAP':
      return {
        'primary-white': "#f1f4f8",
        'sidebar-bg': 'rgb(79 198 223)',
        'light-gray': '#1a204b',
        'light-red': '#CE5151',
        'light-blue': 'rgb(74 200 224)',
        'primary-green': '#14a44d',
        'light-orange': '#F57C00',
        'dark-gray': "#f1f4f8",
        'chalk-blue': "#CCE6FF",
        'semi-orange': "#FCA714",
        'old-lace': "#FCF6EC",
        'fd-primary': "#640811",
        'background-primary': '#F7F8FA',
        'background-secondary': "#640811",
        'hover-primary': "#00B2FF",
        'footer-primary': "#4fc6df33",
        'brand-start':"#AB932B",
        'brand-end':"#AB932B ",
        'shadow': '#47bfdc66',
        'backgred1' :'#E0D9D4',
        'backgred2' : '#E0D9D4',
        'heading-color' :'#122232',
        'cardheader1':'#dee4ffb3',
        'cardheader2' :'#bec6ecd6',
        'popupback':'#09111acc',
        'subcontent':'#98a6b3'

        
      };
      case 'fikaa':
      return {
        'primary-white': "#f1f4f8",
        'sidebar-bg': 'rgb(79 198 223)',
        'light-gray': '#1a204b',
        'light-red': '#CE5151',
        'light-blue': 'rgb(74 200 224)',
        'primary-green': '#d3801d',
        'light-orange': '#F57C00',
        'dark-gray': "#ffff",
        'chalk-blue': "#CCE6FF",
        'semi-orange': "#FCA714",
        'old-lace': "#FCF6EC",
        'fd-primary': "#c9234a",
        'background-primary': '#F7F8FA',
        'background-secondary': "#c9234a",
        'hover-primary': "#00B2FF",
        'footer-primary': "#ffff",
        'brand-start':"#c9234a",
        'brand-end':"#c9234a ",
        'shadow': '#47bfdc66',
        'backgred1' :'#f4f4f4',
        'backgred2' : '#f4f4f4',
        'heading-color' :'#122232',
        'cardheader1':'#dee4ffb3',
        'cardheader2' :'#bec6ecd6',
        'popupback':'#09111acc',
        'subcontent':'#98a6b3'

        
      };
    default:
      return {
        'primary-white': "#f1f5f9",
        'sidebar-bg': '#a09eef',
        'light-gray': '#919191',
        'light-red': '#CE5151',
        'light-blue': '#3B39D9',
        'primary-green': '#65A30D',
        'light-orange': '#F57C00',
        'dark-gray': "#f1f5f9",
        'chalk-blue': "#CCE6FF",
        'semi-orange': "#FCA714",
        'old-lace': "#FCF6EC",
        'fd-primary': "#3b39d9",
        'background-primary': '#F7F8FA',
        'background-secondary': "#3b39d9",
        'hover-primary': "#1A1B1C",
        'footer-primary': "#a3a3a345",
        'brand-start':"#3b39d9",
        'brand-end':"#3b39d9 ",
        'shadow': '#47bfdc66',
        'backgred1' :'#f7f8fa',
        'backgred2' : '#f7f8fa',
        'heading-color' :'#122232',
        'cardheader1':'#f1f5f9',
        'cardheader2' :'#f1f5f9',
        'popupback':'#09111acc',
        'subcontent':'#98a6b3'
      };
      
  }
};

const distributorTheme = getDistributorTheme(distributorCode);

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{html,js}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    screens: {
      'lg': '1199px',
      'sm': '640px',
      'xs': '414px',
    },
    fontSize: {
      sm: '10px',
      base: '12px',
      xl: '14px',
      '2xl': '16px',
      '3xl': '18px',
      '4xl': '18px',
      '5xl': '20px',
      '6xl': '22px',
      '7xl': '24px',
      '8xl': '26px'
    },
    extend: {
      colors: {
        ...distributorTheme,
      },
      
    },
  },
  plugins: [
    require('tw-elements/dist/plugin')
  ],
}
