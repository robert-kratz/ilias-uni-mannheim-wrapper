import { useState } from 'react';
import SaveCredentialsDialog from './dialogs/SaveCredentialsDialog';
import { createToast } from 'vercel-toast';
import { StaticContentAlert } from '../types/objects';

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

type WarningProps = {
    show: boolean;
};

export const SaveCredentialsWarning = ({ show }: WarningProps) => {
    const [open, setOpen] = useState<boolean>(false);

    const onDialogClose = ({ success }: { success: boolean }) => {
        setOpen(false);
    };

    if (!show) {
        return null;
    }

    return (
        <div className="mb-6">
            <SaveCredentialsDialog open={open} onClose={({ success }) => onDialogClose({ success })} />
            <AlertBox
                className="cursor-pointer border-yellow-500 bg-yellow-500 text-yellow-900"
                onClick={() => setOpen(true)}
                content={
                    <p>
                        <strong>Warning:</strong> You still haven't saved your credentials yet!{' '}
                        <span className="underline">Click here</span> to save them in your local keychain.
                    </p>
                }
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path
                            fillRule="evenodd"
                            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                            clipRule="evenodd"
                        />
                    </svg>
                }
            />
        </div>
    );
};

export const StaticContentAlertSection = ({ alerts }: { alerts: StaticContentAlert[] }) => {
    return (
        <div className="space-y-2">
            {alerts.map((alert, index) => {
                if (!alert.active) return null;

                if (alert.type === 'info') {
                    return <InformationAlert key={index} alert={alert} />;
                } else if (alert.type === 'warning') {
                    return <WarningAlert key={index} alert={alert} />;
                } else if (alert.type === 'error') {
                    return <ErrorAlert key={index} alert={alert} />;
                }
            })}
        </div>
    );
};

export const InformationAlert = ({ alert }: { alert: StaticContentAlert }) => {
    return (
        <AlertBox
            className="border-indigo-500 bg-indigo-400 text-indigo-900"
            onClick={() => {}}
            content={
                <p className="space-x-2">
                    <strong>{alert.title}:</strong>
                    <span>{alert.description}</span>
                </p>
            }
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path
                        fillRule="evenodd"
                        d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                        clipRule="evenodd"
                    />
                </svg>
            }
        />
    );
};

export const WarningAlert = ({ alert }: { alert: StaticContentAlert }) => {
    return (
        <AlertBox
            className="border-orange-500 bg-orange-400 text-orange-900"
            onClick={() => {}}
            content={
                <p className="space-x-2">
                    <strong>{alert.title}:</strong>
                    <span>{alert.description}</span>
                </p>
            }
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                        clipRule="evenodd"
                    />
                </svg>
            }
        />
    );
};

export const ErrorAlert = ({ alert }: { alert: StaticContentAlert }) => {
    return (
        <AlertBox
            className="border-red-500 bg-red-400 text-red-900"
            onClick={() => {}}
            content={
                <p className="space-x-2">
                    <strong>{alert.title}:</strong>
                    <span>{alert.description}</span>
                </p>
            }
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path
                        fillRule="evenodd"
                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                        clipRule="evenodd"
                    />
                </svg>
            }
        />
    );
};

type AlertBoxProps = {
    icon: React.ReactNode;
    content: React.ReactNode;
    onClick: () => void;
    className?: string;
};

const AlertBox = ({ icon, onClick, className, content }: AlertBoxProps) => {
    return (
        <div
            onClick={() => onClick()}
            className={classNames(
                'flex items-center justify-start space-x-3 rounded-md border bg-opacity-70 p-3',
                className
            )}>
            <div className="h-6 w-6">{icon}</div>
            <p className="text-sm">{content}</p>
        </div>
    );
};
