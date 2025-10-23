import { TEAM_MEMBERS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Team = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Nuestro Equipo</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profesionales apasionadas dedicadas a tu belleza
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member) => (
            <Card key={member.id} className="shadow-elegant">
              <div className="h-64 overflow-hidden">
                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <p className="text-primary">{member.role}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{member.specialty}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;