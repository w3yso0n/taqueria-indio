import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { agruparPorPlato } from '@/lib/pedido-utils';

interface OrderItem {
    id: number;
    productoNombre: string;
    cantidad: number;
    notas?: string;
    varianteNombre?: string;
    numeroPlato: number; // ← NUEVO
    precioUnitario?: number; // Opcional, no se usa en comanda de cocina
}

interface OrderTicketProps {
    orderId: number;
    customerName: string;
    orderType: string;
    items: OrderItem[];
    createdAt: string;
    printedBy?: string;
}

export function OrderTicket({ orderId, customerName, orderType, items, createdAt, printedBy }: OrderTicketProps) {
    const now = new Date();

    return (
        <div className="ticket">
            <div className="ticket-header">
                <div className="ticket-title">TAQUERIA EL INDIO</div>
                <div className="ticket-subtitle">** COMANDA **</div>
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
                {agruparPorPlato(items.map(item => ({
                    ...item,
                    precioUnitario: item.precioUnitario || 0
                }))).map((plato) => (
                    <div key={plato.numeroPlato} className="ticket-plato">
                        <div className="plato-header">*** PLATO {plato.numeroPlato} ***</div>
                        {plato.items.map((item) => (
                            <div key={item.id} className="ticket-item">
                                <div className="item-qty-name">
                                    {item.cantidad}x {item.productoNombre}
                                </div>
                                {item.varianteNombre && (
                                    <div className="item-variant">  ({item.varianteNombre})</div>
                                )}\n                                {item.notas && (
                                    <div className="item-notes">  Nota: {item.notas}</div>
                                )}
                            </div>
                        ))}
                        <div className="plato-separator">- - - - - - - - - - - - - - - -</div>
                    </div>
                ))}
            </div>

            <div className="ticket-footer">
                <div className="separator">================================</div>
                <div className="footer-center">** PARA PREPARAR **</div>
            </div>
        </div>
    );
}

export function renderOrderTicketToString(props: OrderTicketProps): string {
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
            .ticket-plato {
                margin-bottom: 12px;
            }
            .plato-header {
                font-weight: bold;
                text-align: center;
                margin-bottom: 6px;
                margin-top: 4px;
                font-size: 11px;
            }
            .plato-separator {
                margin-top: 6px;
                margin-bottom: 4px;
                text-align: center;
                font-size: 10px;
            }
            .ticket-item {
                margin-bottom: 6px;
            }
            .item-qty-name {
                font-weight: bold;
            }
            .item-variant, .item-notes {
                font-size: 10px;
                margin-top: 2px;
            }
            .ticket-footer {
                text-align: center;
            }
            .footer-center {
                font-weight: bold;
                font-size: 12px;
            }
        </style>
        <div class="ticket">
            <div class="ticket-header">
                <div class="ticket-title">TAQUERIA EL INDIO</div>
                <div class="ticket-subtitle">** COMANDA **</div>
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
                ${agruparPorPlato(props.items.map(item => ({
        ...item,
        precioUnitario: item.precioUnitario || 0
    }))).map(plato => `
                    <div class="ticket-plato">
                        <div class="plato-header">*** PLATO ${plato.numeroPlato} ***</div>
                        ${plato.items.map(item => `
                            <div class="ticket-item">
                                <div class="item-qty-name">${item.cantidad}x ${item.productoNombre}</div>
                                ${item.varianteNombre ? `<div class="item-variant">  (${item.varianteNombre})</div>` : ''}
                                ${item.notas ? `<div class="item-notes">  Nota: ${item.notas}</div>` : ''}
                            </div>
                        `).join('')}
                        <div class="plato-separator">- - - - - - - - - - - - - - - -</div>
                    </div>
                `).join('')}
            </div>

            <div class="ticket-footer">
                <div class="separator">================================</div>
                <div class="footer-center">** PARA PREPARAR **</div>
            </div>
        </div>
    `;
}
