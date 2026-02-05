import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { cn } from '../../lib/utils';

interface SelectProps {
    label: string;
    placeholder?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: string[];
    error?: string;
    containerClassName?: string; // permite estilizar externamente
    style?: ViewStyle; // caso queira passar estilo inline
}

export const Select: React.FC<SelectProps> = ({
    label,
    placeholder = 'Selecione...',
    value,
    onValueChange,
    options,
    error,
    containerClassName,
    style,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View className={cn('mb-4', containerClassName)} style={style}>
            {/* Label */}
            <Text className="text-sm font-bold text-gray-700 mb-2">{label}</Text>

            {/* Botão de seleção */}
            <TouchableOpacity
                onPress={() => setIsOpen(true)}
                className={cn(
                    'flex-row items-center justify-between bg-white border rounded-xl px-4 py-3',
                    error ? 'border-red-500' : 'border-gray-200'
                )}
                activeOpacity={0.7}
            >
                <Text className={cn('text-base', value ? 'text-gray-900' : 'text-gray-400')}>
                    {value || placeholder}
                </Text>
                <ChevronDown size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* Mensagem de erro */}
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

            {/* Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View className="bg-white rounded-2xl w-4/5 max-h-96 overflow-hidden">
                        {/* Cabeçalho */}
                        <View className="px-4 py-3 border-b border-gray-100">
                            <Text className="text-lg font-bold text-gray-900">{label}</Text>
                        </View>

                        {/* Lista de opções */}
                        <ScrollView className="max-h-80">
                            {options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        onValueChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'px-4 py-3 border-b border-gray-50',
                                        value === option && 'bg-blue-50'
                                    )}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={cn(
                                            'text-base',
                                            value === option ? 'text-blue-600 font-bold' : 'text-gray-900'
                                        )}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Cancelar */}
                        <TouchableOpacity
                            onPress={() => setIsOpen(false)}
                            className="px-4 py-3 border-t border-gray-100"
                            activeOpacity={0.7}
                        >
                            <Text className="text-center text-gray-500 font-bold">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};
