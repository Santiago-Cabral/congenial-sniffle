// src/hooks/useStockMonitor.js

import { useEffect } from 'react';
import { sendLowStockNotification, sendMultipleLowStockNotification } from '../admin/services/whatsappService';
import { useSettings } from '../Context/SettingContext';

export const useStockMonitor = (products) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!products || !settings?.whatsappNewOrder) return;

    // Verificar productos con stock bajo
    const lowStockProducts = products.filter(product => {
      const minStock = product.minStock || 10;
      return product.stock <= minStock && product.stock > 0;
    });

    // Verificar productos sin stock
    const outOfStockProducts = products.filter(product => product.stock === 0);

    // Si hay productos con problemas de stock, notificar
    if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
      console.log(`⚠️ ${lowStockProducts.length} productos con stock bajo`);
      console.log(`🔴 ${outOfStockProducts.length} productos sin stock`);
      
      // Guardar en localStorage para evitar notificaciones duplicadas
      const lastNotification = localStorage.getItem('last_stock_notification');
      const now = Date.now();
      
      // Solo notificar una vez cada 24 horas
      if (!lastNotification || (now - parseInt(lastNotification)) > 24 * 60 * 60 * 1000) {
        // Combinar ambas listas
        const allProblematicProducts = [...lowStockProducts, ...outOfStockProducts];
        
        if (allProblematicProducts.length === 1) {
          // Un solo producto
          sendLowStockNotification(allProblematicProducts[0]);
        } else if (allProblematicProducts.length > 1) {
          // Múltiples productos
          sendMultipleLowStockNotification(allProblematicProducts);
        }
        
        localStorage.setItem('last_stock_notification', now.toString());
      }
    }
  }, [products, settings]);
};