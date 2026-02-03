import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { cn } from '../../lib/utils';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className,
    containerClassName,
    ...props
}) => {
    return (
        <View className={cn('mb-4 w-full', containerClassName)}>
            {label && (
                <Text className="text-gray-700 text-sm font-medium mb-1 ml-1">
                    {label}
                </Text>
            )}
            <TextInput
                className={cn(
                    'bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900',
                    error ? 'border-red-500' : 'focus:border-blue-500',
                    className
                )}
                placeholderTextColor="#9ca3af"
                {...props}
            />
            {error && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                    {error}
                </Text>
            )}
        </View>
    );
};
