import { css } from 'styled-components';

export default {
  global: {
    colors: {
      background: 'transparent',
      brand: '#1f38c5',
      'accent-1': '#1f38c5',
      'accent-2': '#1f38c5',
      'accent-3': '#1f38c5',
      'accent-4': '#1f38c5',
    },
    font: {
      family: 'Poppins, sans-serif',
    },
  },
  formField: {
    border: 'none',
    label: {},
  },
  textInput: {
    extend: css`
      background: rgba(31, 56, 197, 0.08);
      border: 2px solid rgba(31, 56, 197, 0.24);
      border-radius: 8px;
      box-sizing: border-box;
    `,
  },
  button: {
    border: {
      width: '0',
      radius: '8px',
    },
    padding: {
      horizontal: '20px',
      vertical: '16px',
    },
    extend: css`
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    `,
  },
  grommet: {
    extend: css`
      label {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
      }
    `,
  },
};
