import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReceiptItem {
    id: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    varianteNombre?: string;
}

interface ReceiptTicketProps {
    orderId: number;
    customerName: string;
    orderType: string;
    items: ReceiptItem[];
    total: number;
    paymentMethod?: string;
    createdAt: string;
    printedBy?: string;
}

export function ReceiptTicket({ orderId, customerName, orderType, items, total, paymentMethod, createdAt, printedBy }: ReceiptTicketProps) {
    const now = new Date();

    return (
        <div className="ticket">
            <div className="ticket-header">
                <div className="ticket-title">TAQUERIA EL INDIO</div>
                <div className="ticket-subtitle">** CUENTA **</div>
                <div className="separator">================================</div>
            </div>

            <div className="ticket-meta">
                <div>Pedido: #{orderId}</div>
                <div>Fecha: {format(new Date(createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</div>
                <div>Impreso: {format(now, "dd/MM/yyyy HH:mm", { locale: es })}</div>
                {printedBy && <div>Cajero: {printedBy}</div>}
                <div className="separator">--------------------------------</div>
            </div>

            <div className="ticket-customer">
                <div>Cliente: {customerName}</div>
                <div>Tipo: {orderType}</div>
                <div className="separator">================================</div>
            </div>

            <div className="ticket-items">
                <div className="items-header">
                    <span>CANT</span>
                    <span>PRODUCTO</span>
                    <span>PRECIO</span>
                </div>
                <div className="separator">--------------------------------</div>
                {items.map((item) => {
                    const subtotal = item.cantidad * Number(item.precioUnitario);
                    return (
                        <div key={item.id} className="receipt-item">
                            <div className="item-line">
                                <span className="item-qty">{item.cantidad}x</span>
                                <span className="item-name">
                                    {item.productoNombre}
                                    {item.varianteNombre && ` (${item.varianteNombre})`}
                                </span>
                            </div>
                            <div className="item-price-line">
                                <span>${Number(item.precioUnitario).toFixed(2)}</span>
                                <span className="item-subtotal">${subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="ticket-totals">
                <div className="separator">================================</div>
                <div className="total-line">
                    <span className="total-label">TOTAL:</span>
                    <span className="total-amount">${Number(total).toFixed(2)}</span>
                </div>
                {paymentMethod && (
                    <div className="payment-method">
                        Pago: {paymentMethod}
                    </div>
                )}
                <div className="separator">================================</div>
            </div>

            <div className="ticket-footer">
                <div className="footer-center">¡Gracias por su preferencia!</div>
                <div className="footer-center">Vuelva pronto</div>
            </div>
        </div>
    );
}

export function renderReceiptTicketToString(props: ReceiptTicketProps): string {
    const now = new Date();

    return `
        <style>
            .ticket {
                width: 302px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                padding: 8px;
                page-break-after: always;
            }
            .ticket-header {
                text-align: center;
                margin-bottom: 8px;
            }
            .ticket-title {
                font-size: 14px;
                font-weight: bold;
            }
            .ticket-subtitle {
                font-size: 12px;
                font-weight: bold;
                margin-top: 4px;
            }
            .separator {
                margin: 4px 0;
            }
            .ticket-meta, .ticket-customer {
                margin-bottom: 8px;
            }
            .ticket-meta div, .ticket-customer div {
                line-height: 1.4;
            }
            .ticket-items {
                margin-bottom: 8px;
            }
            .items-header {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 10px;
            }
            .receipt-item {
                margin-bottom: 6px;
            }
            .item-line {
                display: flex;
                gap: 4px;
            }
            .item-qty {
                font-weight: bold;
                min-width: 25px;
            }
            .item-name {
                flex: 1;
            }
            .item-price-line {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                padding-left: 29px;
            }
            .item-subtotal {
                font-weight: bold;
            }
            .ticket-totals {
                margin-bottom: 8px;
            }
            .total-line {
                display: flex;
                justify-content: space-between;
                font-size: 13px;
                font-weight: bold;
                margin: 8px 0;
            }
            .payment-method {
                text-align: center;
                font-size: 11px;
            }
            .ticket-footer {
                text-align: center;
                margin-top: 8px;
            }
            .footer-center {
                font-size: 11px;
                line-height: 1.4;
            }
        </style>
        <div class="ticket">
            <div class="ticket-header">
                <div class="ticket-title">TAQUERIA EL INDIO</div>
                <div class="ticket-subtitle">** CUENTA **</div>
                <div class="separator">================================</div>
            </div>

            <div class="ticket-meta">
                <div>Pedido: #${props.orderId}</div>
                <div>Fecha: ${format(new Date(props.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</div>
                <div>Impreso: ${format(now, "dd/MM/yyyy HH:mm", { locale: es })}</div>
                ${props.printedBy ? `<div>Cajero: ${props.printedBy}</div>` : ''}
                <div class="separator">--------------------------------</div>
            </div>

            <div class="ticket-customer">
                <div>Cliente: ${props.customerName}</div>
                <div>Tipo: ${props.orderType}</div>
                <div class="separator">================================</div>
            </div>

            <div class="ticket-items">
                <div class="items-header">
                    <span>CANT</span>
                    <span>PRODUCTO</span>
                    <span>PRECIO</span>
                </div>
                <div class="separator">--------------------------------</div>
                ${props.items.map(item => {
        const subtotal = item.cantidad * Number(item.precioUnitario);
        return `
                        <div class="receipt-item">
                            <div class="item-line">
                                <span class="item-qty">${item.cantidad}x</span>
                                <span class="item-name">${item.productoNombre}${item.varianteNombre ? ` (${item.varianteNombre})` : ''}</span>
                            </div>
                            <div class="item-price-line">
                                <span>$${Number(item.precioUnitario).toFixed(2)}</span>
                                <span class="item-subtotal">$${subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>

            <div class="ticket-totals">
                <div class="separator">================================</div>
                <div class="total-line">
                    <span class="total-label">TOTAL:</span>
                    <span class="total-amount">$${Number(props.total).toFixed(2)}</span>
                </div>
                ${props.paymentMethod ? `
                    <div class="payment-method">Pago: ${props.paymentMethod}</div>
                ` : ''}
                <div class="separator">================================</div>
            </div>

            <div class="ticket-footer">
                <div class="footer-center">¡Gracias por su preferencia!</div>
                <div class="footer-center">Vuelva pronto</div>
            </div>
        </div>
    `;
}
