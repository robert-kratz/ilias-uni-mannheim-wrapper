import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    height?: string;
    width?: string;
};

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

export default function DialogModal({ open, onClose, children, height = 'auto', width = 'max-w-md' }: Props) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={() => onClose()}>
                {/* Background */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 z-20 bg-black bg-opacity-30" />
                </Transition.Child>

                <div className="fixed inset-0 z-20 overflow-y-auto">
                    <div className="flex min-h-full min-w-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95">
                            <Dialog.Panel
                                className={classNames(
                                    'w-full transform space-y-4 overflow-hidden rounded-lg bg-dark-gray-2 p-6 text-left align-middle text-white shadow-xl transition-all sm:p-8 md:space-y-6',
                                    height,
                                    width
                                )}>
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

type DialogTitleProps = {
    title: string;
    description: string;
};

const DialogTitle = ({ title, description }: DialogTitleProps) => (
    <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-sm text-gray-200">{description}</p>
    </div>
);

type ButtonProps = {
    onClick: () => void;
    disabled: boolean;
    loading?: boolean;
    text: string;
};

const Button = ({ onClick, disabled, text, loading }: ButtonProps) => (
    <button
        type="submit"
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
        disabled={disabled}
        className="flex justify-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
        <div className="flex items-center justify-center space-x-2">
            {disabled && loading && (
                <div
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                    </span>
                </div>
            )}
            <span>{text}</span>
        </div>
    </button>
);

type CancelButtonProps = {
    onClick: () => void;
    text: string;
};

const CancelButton = ({ onClick, text }: CancelButtonProps) => (
    <button
        type="submit"
        onClick={(e: any) => {
            e.preventDefault();
            onClick();
        }}
        className="block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-gray-200 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
        {text}
    </button>
);

type ButtonActionWrapperProps = {
    children: React.ReactNode;
};

const ButtonActionWrapper = ({ children }: ButtonActionWrapperProps) => (
    <div className="flex items-center justify-end space-x-4 pt-4">{children}</div>
);

type InputFieldProps = {
    label: string;
    name: string;
    type: string;
    autoComplete?: string;
    autoCorrect?: string;
    disabled?: boolean;
    id: string;
    value: string;
    onChange: (e: any) => void;
};

const DialogInputField = ({
    label,
    name,
    type,
    disabled,
    autoComplete = 'off',
    autoCorrect = 'off',
    id,
    value,
    onChange,
}: InputFieldProps) => (
    <>
        <label htmlFor={id} className="block text-sm font-semibold leading-6 text-gray-200">
            {label}
        </label>
        <div className="mt-2.5">
            <input
                type={type}
                name={name}
                id={id}
                disabled={disabled}
                autoComplete={autoComplete}
                autoCorrect={autoCorrect}
                value={value}
                onChange={(e) => onChange(e)}
                className="w-full rounded-md border-2 border-dark-gray bg-dark-gray-3 p-4 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    </>
);

type DialogInputPasswordFieldProps = {
    label: string;
    name: string;
    id: string;
    value: string;
    disabled?: boolean;
    showPassword: boolean;
    autoComplete?: string;
    autoCorrect?: string;
    onVisibilityChange: () => void;
    onChange: (e: any) => void;
};

const DialogInputPasswordField = ({
    label,
    name,
    id,
    value,
    onChange,
    disabled,
    showPassword,
    onVisibilityChange,
    autoComplete = 'password',
    autoCorrect = 'off',
}: DialogInputPasswordFieldProps) => (
    <div className="col-span-2">
        <div className="flex items-center justify-between">
            <label htmlFor={id} className="block text-sm font-semibold leading-6 text-gray-200">
                {label}
            </label>
            <a
                onClick={onVisibilityChange}
                className="block cursor-pointer text-sm font-semibold leading-6 text-violet-500 hover:text-violet-600">
                {showPassword ? 'Hide' : 'Show'}
            </a>
        </div>
        <div className="mt-2.5">
            <input
                type={showPassword ? 'text' : 'password'}
                name={name}
                id={id}
                autoComplete={autoComplete}
                autoCorrect={autoCorrect}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e)}
                className="w-full rounded-md border-2 border-dark-gray bg-dark-gray-3 p-4 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    </div>
);

type DialogFormProps = {
    children: React.ReactNode;
};

const DialogForm = ({ children }: DialogFormProps) => (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6">
        <form action={''} method="" className="col-span-2 space-y-2">
            {children}
        </form>
    </div>
);

export {
    DialogTitle,
    Button,
    CancelButton,
    ButtonActionWrapper,
    DialogInputField,
    DialogInputPasswordField,
    DialogForm,
};
