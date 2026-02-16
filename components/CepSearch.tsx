import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { apiService } from '../lib/api';

/**
 * Componente de Exemplo: CepSearch
 * 
 * Demonstra como usar o método buscarCep do apiService para:
 * 1. Enviar um dado para uma API (Request POST/GET)
 * 2. Receber e tratar o JSON de retorno (Response)
 * 3. Atualizar a interface com os dados recebidos
 */
export const CepSearch = () => {
    const [cep, setCep] = useState('');
    const [loading, setLoading] = useState(false);
    const [endereco, setEndereco] = useState({
        logradouro: '',
        bairro: '',
        localidade: '',
        uf: ''
    });

    const handleBuscarCep = async () => {
        if (cep.length < 8) {
            Alert.alert('Erro', 'Por favor, digite um CEP válido.');
            return;
        }

        setLoading(true);
        try {
            const data = await apiService.buscarCep(cep);

            // Aqui 'data' é o JSON que a API da ViaCEP retornou
            setEndereco({
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                localidade: data.localidade || '',
                uf: data.uf || ''
            });

        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Ocorreu um erro ao buscar o CEP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Busca de Endereço (ViaCEP)</Text>

            <View style={styles.inputGroup}>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o CEP (ex: 01001000)"
                    value={cep}
                    onChangeText={setCep}
                    keyboardType="numeric"
                    maxLength={8}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleBuscarCep}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Buscar</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Campos que serão preenchidos automaticamente */}
            <View style={styles.resultContainer}>
                <Text style={styles.label}>Rua:</Text>
                <TextInput style={styles.inputDisabled} value={endereco.logradouro} editable={false} />

                <Text style={styles.label}>Bairro:</Text>
                <TextInput style={styles.inputDisabled} value={endereco.bairro} editable={false} />

                <View style={styles.row}>
                    <View style={{ flex: 2, marginRight: 10 }}>
                        <Text style={styles.label}>Cidade:</Text>
                        <TextInput style={styles.inputDisabled} value={endereco.localidade} editable={false} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>UF:</Text>
                        <TextInput style={styles.inputDisabled} value={endereco.uf} editable={false} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        margin: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center'
    },
    inputGroup: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    resultContainer: {
        marginTop: 10,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    inputDisabled: {
        height: 45,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#fafafa',
        marginBottom: 10,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
    }
});
