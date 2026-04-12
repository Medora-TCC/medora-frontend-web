import maintenanceIcon from '../../assets/maintenance.svg';

export function Maintenance() {
    return (
        <div className="bg-surface w-full max-w-md rounded-2xl shadow-xs border border-border p-4 mx-2 md:p-8 md:mx-0 flex flex-col gap-4 items-center text-center">
            <img src={maintenanceIcon} alt="Ilustração de página em manuteção" className="h-80 w-auto object-contain"/>
            <div className="flex flex-col gap-2 w-full">
                <h1 className="text-2xl font-bold text-warning mx-auto">Site em manutenção</h1>
                <p className="text-muted-foreground opacity-80 leading-relaxed">O site está atualmente em manutenção programada para melhor atendê-lo.</p>
                <p className="text-muted-foreground opacity-80 leading-relaxed">Estaremos de volta logo.</p>
            </div>
        </div>
    )
}