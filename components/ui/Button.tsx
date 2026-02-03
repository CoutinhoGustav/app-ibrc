import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    loading?: boolean;
    textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    loading = false,
    children,
    textClassName,
    ...props
}) => {
    const variants = {
        primary: 'bg-blue-600',
        secondary: 'bg-gray-200',
        outline: 'border border-gray-300 bg-transparent',
        ghost: 'bg-transparent',
        danger: 'bg-red-600',
    };

    const textVariants = {
        primary: 'text-white',
        secondary: 'text-gray-900',
        outline: 'text-gray-900',
        ghost: 'text-gray-900',
        danger: 'text-white',
    };

    return (
        <TouchableOpacity
            className={cn('flex-row items-center justify-center rounded-xl px-4 py-3', variants[variant], className)}
            disabled={loading || props.disabled}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? 'white' : '#2563eb'} />
            ) : (
                <Text className={cn('text-base font-bold', textVariants[variant], textClassName)}>{children}</Text>
            )}
        </TouchableOpacity>
    );
};
