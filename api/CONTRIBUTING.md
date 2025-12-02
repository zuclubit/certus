# Guia de Contribucion - Certus API

Gracias por tu interes en contribuir a Certus API. Este documento proporciona las guias y mejores practicas para contribuir al proyecto.

## Tabla de Contenidos

- [Codigo de Conducta](#codigo-de-conducta)
- [Como Contribuir](#como-contribuir)
- [Configuracion del Entorno](#configuracion-del-entorno)
- [Estandares de Codigo](#estandares-de-codigo)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Testing](#testing)
- [Commits](#commits)

## Codigo de Conducta

Este proyecto sigue un codigo de conducta profesional. Esperamos que todos los contribuidores:

- Sean respetuosos y profesionales
- Acepten criticas constructivas
- Se enfoquen en lo mejor para el proyecto
- Muestren empatia hacia otros miembros del equipo

## Como Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado previamente
2. Usa la plantilla de Bug Report
3. Incluye pasos detallados para reproducir el problema
4. Agrega logs y screenshots relevantes

### Proponer Funcionalidades

1. Abre un Feature Request con la plantilla correspondiente
2. Describe el problema que resuelve
3. Incluye criterios de aceptacion claros

### Contribuir Codigo

1. Fork el repositorio
2. Crea una rama desde `develop`
3. Implementa los cambios
4. Asegurate de que los tests pasen
5. Abre un Pull Request

## Configuracion del Entorno

### Prerrequisitos

- .NET 9.0 SDK
- Docker Desktop
- PostgreSQL 16 (o usar Docker)
- IDE: Visual Studio 2022, VS Code, o Rider

### Setup Local

```bash
# Clonar el repositorio
git clone https://github.com/sh-certus/certus-api.git
cd certus-api

# Iniciar servicios con Docker
docker-compose -f docker-compose.dev.yml up -d

# Restaurar dependencias
dotnet restore

# Aplicar migraciones
dotnet ef database update -p src/Certus.Infrastructure -s src/Certus.Api

# Ejecutar la API
dotnet run --project src/Certus.Api
```

### Variables de Entorno

Copia `.env.example` a `.env` y configura las variables necesarias:

```bash
cp .env.example .env
```

## Estandares de Codigo

### Arquitectura

Seguimos Clean Architecture con las siguientes capas:

```
src/
├── Certus.Domain/        # Entidades, enums, interfaces del dominio
├── Certus.Application/   # CQRS handlers, DTOs, validaciones
├── Certus.Infrastructure/# EF Core, servicios externos
└── Certus.Api/          # Controllers, middleware
```

### Convenciones de Nomenclatura

- **Clases/Interfaces**: PascalCase (`ValidationService`, `IUserRepository`)
- **Metodos**: PascalCase (`GetValidationById`)
- **Variables/Parametros**: camelCase (`validationId`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Archivos**: PascalCase (`UserController.cs`)

### Patrones a Seguir

- **CQRS**: Separar Commands y Queries
- **Repository Pattern**: Para acceso a datos
- **Domain Events**: Para comunicacion entre dominios
- **Result Pattern**: Para manejo de errores

### Ejemplo de Query Handler

```csharp
public class GetValidationByIdQueryHandler
    : IRequestHandler<GetValidationByIdQuery, Result<ValidationDto>>
{
    private readonly IValidationRepository _repository;
    private readonly IMapper _mapper;

    public GetValidationByIdQueryHandler(
        IValidationRepository repository,
        IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<ValidationDto>> Handle(
        GetValidationByIdQuery request,
        CancellationToken cancellationToken)
    {
        var validation = await _repository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (validation is null)
            return Result<ValidationDto>.NotFound("Validation not found");

        return Result<ValidationDto>.Success(
            _mapper.Map<ValidationDto>(validation));
    }
}
```

## Proceso de Pull Request

### Antes de Abrir el PR

1. Actualiza tu rama con los ultimos cambios de `develop`
2. Ejecuta todos los tests localmente
3. Verifica que no hay warnings nuevos
4. Revisa que el codigo siga los estandares

### Creando el PR

1. Usa la plantilla de PR proporcionada
2. Describe claramente los cambios
3. Referencia el issue relacionado
4. Completa el checklist

### Proceso de Review

- Al menos 1 aprobacion requerida
- Todos los checks de CI deben pasar
- Los comentarios deben resolverse
- El codigo debe seguir las guias

## Testing

### Estructura de Tests

```
tests/
├── Certus.Application.Tests/     # Unit tests de Application
├── Certus.Infrastructure.Tests/  # Tests de Infrastructure
└── Certus.Api.Tests/            # Integration tests
```

### Ejecutar Tests

```bash
# Todos los tests
dotnet test

# Tests con coverage
dotnet test --collect:"XPlat Code Coverage"

# Tests especificos
dotnet test --filter "FullyQualifiedName~ValidationTests"
```

### Escribiendo Tests

```csharp
public class GetValidationByIdQueryHandlerTests
{
    private readonly Mock<IValidationRepository> _repositoryMock;
    private readonly GetValidationByIdQueryHandler _handler;

    public GetValidationByIdQueryHandlerTests()
    {
        _repositoryMock = new Mock<IValidationRepository>();
        _handler = new GetValidationByIdQueryHandler(
            _repositoryMock.Object,
            CreateMapper());
    }

    [Fact]
    public async Task Handle_ValidId_ReturnsValidation()
    {
        // Arrange
        var validationId = Guid.NewGuid();
        var validation = CreateTestValidation(validationId);
        _repositoryMock
            .Setup(r => r.GetByIdAsync(validationId, default))
            .ReturnsAsync(validation);

        // Act
        var result = await _handler.Handle(
            new GetValidationByIdQuery(validationId),
            default);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(validationId);
    }
}
```

## Commits

### Formato de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance>): <descripcion>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Correccion de bug
- `docs`: Cambios en documentacion
- `style`: Cambios de formato (no afectan codigo)
- `refactor`: Refactoring de codigo
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
feat(validations): add substitute validation endpoint

fix(auth): resolve JWT token expiration issue

docs(readme): update installation instructions

refactor(scrapers): extract common scraper logic
```

## Preguntas?

Si tienes dudas, puedes:

- Abrir un Discussion en GitHub
- Contactar al equipo en soporte@hergon.digital
