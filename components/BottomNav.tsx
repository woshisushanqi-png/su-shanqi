import React from 'react';

type View = 'draw' | 'camera' | 'translate' | 'history';

interface BottomNavProps {
    current: View;
    onChange: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ current, onChange }) => {
    const navItems: {id: View, icon: string, filledIcon: string, label: string}[] = [
        { id: 'draw', icon: 'brush', filledIcon: 'brush', label: 'Draw' },
        { id: 'camera', icon: 'camera_alt', filledIcon: 'camera_alt', label: 'Camera' },
        { id: 'translate', icon: 'translate', filledIcon: 'translate', label: 'Translate' },
        { id: 'history', icon: 'history', filledIcon: 'history', label: 'History' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/50 pb-safe z-50">
            <div className="flex justify-around items-center h-[55px] max-w-2xl mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = current === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className="flex-1 flex flex-col items-center justify-center active:scale-95 transition-transform duration-100"
                        >
                            <span className={`material-icons-round text-[28px] mb-0.5 transition-colors ${isActive ? 'text-ios-blue' : 'text-gray-400'}`}>
                                {isActive ? item.filledIcon : item.icon}
                            </span>
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-ios-blue' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default BottomNav;