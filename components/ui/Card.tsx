import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

export const Card: React.FC<ViewProps> = ({ className, children, ...props }) => {
    return (
        <View className={cn('bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4', className)} {...props}>
            {children}
        </View>
    );
};

export const CardHeader: React.FC<ViewProps> = ({ className, children, ...props }) => {
    return (
        <View className={cn('mb-4', className)} {...props}>
            {children}
        </View>
    );
};

export const CardContent: React.FC<ViewProps> = ({ className, children, ...props }) => {
    return (
        <View className={cn('', className)} {...props}>
            {children}
        </View>
    );
};
