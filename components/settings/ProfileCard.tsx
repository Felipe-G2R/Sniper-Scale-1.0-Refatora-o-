import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon } from '../icons';
import { useAnalysisManager } from '../../hooks/useAnalysisManager';
import type { User } from '../../types';
import { GENERIC_AVATAR_URL } from '../../constants';

const InfoField: React.FC<{ label: string; value: string; isEditing: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, isEditing, onChange }) => (
    <div>
        <label className="text-xs text-gray-400">{label}</label>
        {isEditing ? (
            <input 
                type="text"
                value={value}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-md p-1 mt-1 focus:ring-cyan-500 focus:border-cyan-500"
            />
        ) : (
            <p className="text-sm text-white mt-1 truncate">{value}</p>
        )}
    </div>
);


const ProfileCard: React.FC = () => {
    const { state, updateUserInfo } = useAnalysisManager();
    const { user } = state;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editableUser, setEditableUser] = useState<User>(user);

    useEffect(() => {
        setEditableUser(user);
    }, [user]);

    const handleInputChange = (field: keyof User) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableUser(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = () => {
        updateUserInfo(editableUser);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setEditableUser(user);
        setIsEditing(false);
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditableUser(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            console.error("Please select a valid image file.");
            // Optionally, show a user-facing notification here.
        }
    };


    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
            />

            <div className="bg-gradient-to-br from-[#1E535E] via-[#0A0E13] to-[#0A0E13] border border-cyan-400/20 rounded-2xl p-6 text-center">
                <div className="relative w-32 h-32 mx-auto">
                    <img className="w-full h-full rounded-full object-cover border-4 border-[#161b22]" src={editableUser.avatarUrl || GENERIC_AVATAR_URL} alt="User" />
                    {isEditing && (
                         <div 
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={handleAvatarClick}
                            title="Alterar foto de perfil"
                          >
                            <div className="text-white hover:text-cyan-400">
                                <CameraIcon className="w-8 h-8" />
                            </div>
                         </div>
                    )}
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2 h-7">
                        {isEditing ? (
                             <input 
                                type="text"
                                value={editableUser.name}
                                onChange={handleInputChange('name')}
                                className="w-full bg-gray-800 border border-gray-600 text-white text-lg text-center font-bold rounded-md p-1 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        ) : (
                           <h2 className="text-xl font-bold text-white">{user.name}</h2>
                        )}
                    </div>
                    <p className="text-sm text-gray-400 h-5">{isEditing ? ' ' : user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-full">Usuário Sniper Scale</span>
                </div>
            </div>

            <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6 space-y-4">
                <InfoField label="ID do Usuário" value={user.uid} isEditing={false} onChange={() => {}} />
                <div className="border-t border-gray-700/50"></div>
                <InfoField label="Email" value={editableUser.email} isEditing={isEditing} onChange={handleInputChange('email')} />
                <div className="border-t border-gray-700/50"></div>
                 <InfoField label="URL da Foto do Perfil" value={editableUser.avatarUrl} isEditing={false} onChange={() => {}} />
            </div>

            {isEditing ? (
                 <div className="flex space-x-2">
                    <button onClick={handleCancel} className="w-full px-4 py-2.5 text-sm font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="w-full px-4 py-2.5 text-sm font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400">
                        Salvar Alterações
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2.5 text-sm font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400">
                    Editar Perfil
                </button>
            )}
        </>
    );
};

export default ProfileCard;