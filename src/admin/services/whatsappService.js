// src/admin/services/whatsappService.js

const WHATSAPP_NUMBER = "+5493814669136"; // Formato internacional (Argentina: 549 + código de área sin 0 + número)

/**
 * Genera un enlace de WhatsApp con un mensaje pre-escrito
 */
export const generateWhatsAppLink = (message) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

/**
 * Abre WhatsApp con un mensaje pre-escrito
 */
export const openWhatsApp = (message) => {
  const link = generateWhatsAppLink(message);
  window.open(link, '_blank');
};

/**
 * Envía notificación de nueva orden por WhatsApp
 */
export const sendNewOrderNotification = (orderData) => {
  const {
    id,
    customer,
    items,
    total,
    shippingCost,
    paymentMethod,
    fulfillmentMethod,
    customerDetails
  } = orderData;

  // Construir mensaje detallado
  let message = `🔔 *NUEVA ORDEN #${id}*\n\n`;
  message += `👤 *Cliente:* ${customerDetails?.name || customer}\n`;
  message += `📱 *Teléfono:* ${customerDetails?.phone || 'No especificado'}\n`;
  message += `📧 *Email:* ${customerDetails?.email || 'No especificado'}\n`;
  
  if (fulfillmentMethod === 'delivery') {
    message += `📍 *Dirección:* ${customerDetails?.address || 'No especificada'}\n`;
    message += `🚚 *Tipo:* Envío a domicilio\n`;
  } else {
    message += `🛍️ *Tipo:* Retiro en local\n`;
  }

  message += `\n💰 *DETALLE DEL PEDIDO:*\n`;
  message += `━━━━━━━━━━━━━━━━\n`;

  // Listar productos
  items.forEach((item, index) => {
    const itemName = item.productName || item.name || `Producto ${item.productId}`;
    const itemQty = item.quantity;
    const itemPrice = item.unitPrice;
    const itemTotal = itemQty * itemPrice;
    
    message += `${index + 1}. ${itemName}\n`;
    message += `   • Cantidad: ${itemQty}\n`;
    message += `   • Precio: $${itemPrice.toLocaleString()}\n`;
    message += `   • Subtotal: $${itemTotal.toLocaleString()}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━\n`;
  message += `💵 *Subtotal:* $${(total - shippingCost).toLocaleString()}\n`;
  message += `🚚 *Envío:* $${shippingCost.toLocaleString()}\n`;
  message += `💳 *Total:* $${total.toLocaleString()}\n\n`;

  // Método de pago
  const paymentMethods = {
    cash: '💵 Efectivo',
    transfer: '🏦 Transferencia',
    card: '💳 Tarjeta'
  };
  message += `💰 *Método de pago:* ${paymentMethods[paymentMethod] || paymentMethod}\n\n`;

  message += `⏰ *Fecha:* ${new Date().toLocaleString('es-AR')}\n\n`;
  message += `✅ *Acción requerida:* Confirmar el pedido con el cliente`;

  return openWhatsApp(message);
};

/**
 * Envía notificación de stock bajo por WhatsApp
 */
export const sendLowStockNotification = (productData) => {
  const {
    id,
    name,
    stock,
    minStock,
    category,
    price
  } = productData;

  let message = `⚠️ *ALERTA DE STOCK BAJO*\n\n`;
  message += `📦 *Producto:* ${name}\n`;
  message += `🆔 *ID:* ${id}\n`;
  message += `📁 *Categoría:* ${category || 'Sin categoría'}\n`;
  message += `💰 *Precio:* $${price?.toLocaleString() || 'N/A'}\n\n`;
  message += `━━━━━━━━━━━━━━━━\n`;
  message += `📊 *Stock actual:* ${stock} unidades\n`;
  message += `⚡ *Stock mínimo:* ${minStock || 10} unidades\n`;
  message += `🔴 *Diferencia:* ${(minStock || 10) - stock} unidades faltantes\n\n`;
  message += `⏰ *Fecha:* ${new Date().toLocaleString('es-AR')}\n\n`;
  message += `✅ *Acción requerida:* Reabastecer este producto lo antes posible`;

  return openWhatsApp(message);
};

/**
 * Envía notificación de múltiples productos con stock bajo
 */
export const sendMultipleLowStockNotification = (products) => {
  let message = `⚠️ *ALERTA: ${products.length} PRODUCTOS CON STOCK BAJO*\n\n`;
  
  products.forEach((product, index) => {
    message += `${index + 1}. *${product.name}*\n`;
    message += `   Stock: ${product.stock} (Min: ${product.minStock || 10})\n`;
    message += `   Faltan: ${(product.minStock || 10) - product.stock} unidades\n\n`;
  });

  message += `⏰ *Fecha:* ${new Date().toLocaleString('es-AR')}\n\n`;
  message += `✅ *Acción requerida:* Revisar inventario y reabastecer productos`;

  return openWhatsApp(message);
};

/**
 * Envía notificación personalizada
 */
export const sendCustomNotification = (title, details) => {
  let message = `📢 *${title}*\n\n`;
  message += details;
  message += `\n\n⏰ *Fecha:* ${new Date().toLocaleString('es-AR')}`;

  return openWhatsApp(message);
};