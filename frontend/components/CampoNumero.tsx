"use client";

interface Props {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  error?: string | null;
  unidadIzq?: string;
  unidadDer?: string;
  placeholder?: string;
}

/**
 * Campo de entrada numerica reutilizable con soporte de unidades adosadas y retroalimentacion de error.
 * 
 * Permite prefijos monetarios a la izquierda (ej: 'Bs') o sufijos descriptivos a la derecha (ej: '%', 'anos').
 * Modifica dinamicamente el contorno y el fondo ante estados de validacion fallidos.
 */
export default function CampoNumero({
  etiqueta,
  valor,
  onChange,
  error,
  unidadIzq,
  unidadDer,
  placeholder,
}: Props) {
  const borde = error
    ? "border-[#a3321e] bg-[#fdf6f4]"
    : "border-[#d3d7cc] bg-white focus-within:border-[#14202a] focus-within:ring-2 focus-within:ring-[#14202a]/10";

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#5a6872]">
        {etiqueta}
      </label>
      <div className={`flex items-stretch overflow-hidden rounded border transition ${borde}`}>
        {unidadIzq && (
          <span className="flex items-center border-r border-[#e6e8e1] bg-[#fafbf8] px-2.5 font-mono text-[13px] text-[#5a6872]">
            {unidadIzq}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 font-mono text-[15px] text-[#14202a] outline-none"
        />
        {unidadDer && (
          <span className="flex items-center border-l border-[#e6e8e1] px-2.5 font-mono text-[13px] text-[#5a6872]">
            {unidadDer}
          </span>
        )}
      </div>
      <p className="mt-1 min-h-[17px] text-[12.5px] text-[#a3321e]">
        {error}
      </p>
    </div>
  );
}
