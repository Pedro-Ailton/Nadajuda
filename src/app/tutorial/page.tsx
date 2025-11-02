
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Flame, Trophy, User, Bot, BarChart } from 'lucide-react';
import { Logo } from '@/components/logo';

const features = [
    {
        icon: <Home className="h-8 w-8 text-primary" />,
        title: 'Painel Principal',
        description: 'Tenha uma visão geral do seu progresso, com o seu melhor tempo recente, total de competições e um gráfico de performance.',
    },
    {
        icon: <Flame className="h-8 w-8 text-primary" />,
        title: 'Registo de Treinos',
        description: 'Crie e edite as suas séries de treino de forma detalhada. Adicione fases, repetições, descrições, e registe os tempos de cada tiro.',
    },
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: 'Treinador com IA',
        description: 'Não sabe o que treinar hoje? Deixe que a nossa Inteligência Artificial crie um treino personalizado para si com base nos seus objetivos.',
    },
    {
        icon: <Trophy className="h-8 w-8 text-primary" />,
        title: 'Registo de Competições',
        description: 'Registe os seus tempos oficiais de competição. Selecione a prova e insira o seu tempo em minutos, segundos e milissegundos.',
    },
    {
        icon: <User className="h-8 w-8 text-primary" />,
        title: 'Perfil',
        description: 'Mantenha os seus dados atualizados. A sua data de nascimento é importante para que a IA possa gerar treinos adequados à sua idade.',
    }
]

export default function TutorialPage() {
    const router = useRouter();

    const handleStart = () => {
        router.push('/dashboard');
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-headline font-bold">Bem-vindo(a) ao NadAjuda!</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Aqui está um resumo do que pode fazer na aplicação.</p>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <Card key={feature.title} className="shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    {feature.icon}
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </main>
                
                <footer className="text-center mt-12">
                    <Button onClick={handleStart} size="lg">
                        Começar a Usar!
                    </Button>
                </footer>
            </div>
        </div>
    )
}
