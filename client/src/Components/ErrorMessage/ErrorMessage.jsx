import React from 'react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = () => {
  return (
    <div className={styles.errorMessage}>
      <p>Комната полная. Пожалуйста, подождите или попробуйте позже.</p>
    </div>
  );
};

export default ErrorMessage;
