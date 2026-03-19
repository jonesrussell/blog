# Waaseyaa Blog Series — Accuracy Audit

Cross-referenced all blog posts against actual code in `/home/jones/dev/waaseyaa/` and `/home/jones/dev/minoo/`.

---

## waaseyaa-intro — 5 issues found

- **Line 18**: Claims "43-package monorepo." Actual package count is 43 directories under `packages/`, so this is correct.

- **Line 26**: Says "PHP 8.4 attributes instead of annotations." Actual code does use PHP 8.4 attributes (e.g., `#[PolicyAttribute(...)]` in access policies). Correct.

- **Line 35-42**: Layer architecture lists "Layer 0: core, types, contracts." There are no packages named `types` or `contracts` in the monorepo. The actual Layer 0 packages (per the split workflow) are: foundation, cache, plugin, typed-data, database-legacy, testing, i18n, queue, state, validation, mail, github. The blog's layer names don't match the actual package names.

- **Line 46**: Says "The packages that map directly to Drupal concepts: entity, field, node, taxonomy, access, vocabulary, content-type." There is no `vocabulary` package in the monorepo. There is no `content-type` package either. The actual packages are: entity, field, node, taxonomy, access (correct), plus media, menu, note, path, relationship (not mentioned).

- **Line 18**: Says "forked from Drupal 11's core." The license is GPL-2.0-or-later, consistent with a Drupal fork. No issue here, just noting.

- **Line 18**: Says version implies maturity. Actual root composer.json shows `"version": "1.1.0"` but subpackages use `^0.1` constraints and Minoo requires `^0.1.0-alpha.25`. The blog doesn't mention this is alpha/pre-1.0 software despite the root version tag of 1.1.0.

---

## waaseyaa-entity-system — 12 issues found

- **Line 27-35**: `EntityInterface` shown in blog:
  ```php
  public function getId(): EntityId;
  public function getEntityType(): string;
  public function getFields(): FieldCollection;
  public function getField(string $name): ?FieldInterface;
  public function toArray(): array;
  public function fromArray(array $data): static;
  ```
  **Actual** `EntityInterface` (`packages/entity/src/EntityInterface.php`):
  ```php
  public function id(): int|string|null;
  public function uuid(): string;
  public function label(): string;
  public function getEntityTypeId(): string;
  public function bundle(): string;
  public function isNew(): bool;
  public function toArray(): array;
  public function language(): string;
  ```
  Nearly every method is wrong:
  - `getId()` does not exist. Actual: `id(): int|string|null`
  - `EntityId` value object does not exist anywhere in the codebase
  - `getEntityType()` does not exist. Actual: `getEntityTypeId(): string`
  - `getFields(): FieldCollection` does not exist. There is no `FieldCollection` class in the codebase at all
  - `getField(string $name): ?FieldInterface` does not exist on EntityInterface. `ContentEntityBase` has `get(string $name): mixed` and `hasField(string $name): bool`
  - `fromArray(array $data): static` does not exist on EntityInterface

- **Line 40**: Claims "`getId()` returns an `EntityId` value object, never a scalar." False. `EntityId` does not exist. `id()` returns `int|string|null`.

- **Line 42**: Claims "`getField()` returns `?FieldInterface`, never throwing on an unregistered field name." The actual method on `ContentEntityBase` is `get(string $name): mixed`, which returns `$this->values[$name] ?? null`. It doesn't return `FieldInterface`.

- **Line 44**: Claims "`toArray()` is the serialization contract used by `ResourceSerializer`." This is correct — `ResourceSerializer` does call `$entity->toArray()`.

- **Line 51-70**: `ContentEntityBase` shown in blog:
  ```php
  private EntityId $id;
  private FieldCollection $fields;
  private string $entityType;
  public function __construct(string $entityType, EntityId $id)
  ```
  **Actual** constructor:
  ```php
  public function __construct(
      array $values = [],
      string $entityTypeId = '',
      array $entityKeys = [],
      array $fieldDefinitions = [],
  )
  ```
  Every property and the constructor signature are wrong:
  - No `EntityId $id` property — uses `$values` array with entity keys
  - No `FieldCollection $fields` — uses `$fieldDefinitions` array
  - No `$entityType` string property — uses `$entityTypeId` (inherited from `EntityBase`)
  - Constructor takes `array $values`, not `string $entityType, EntityId $id`

- **Line 69**: Claims `abstract public function buildFields(): void;` exists. This method does not exist on `ContentEntityBase`. Fields are defined via `$fieldDefinitions` array or the `getFieldDefinitions()` method, not a `buildFields()` pattern.

- **Line 77-88**: `FieldInterface` shown with methods `getName()`, `getType()`, `getValue()`, `setValue()`, `validate()`, `toArray()`. The actual field interface is `FieldItemInterface` in `Waaseyaa\Field` namespace, with completely different methods: `isEmpty()`, `getFieldDefinition()`, `propertyDefinitions()`, `mainPropertyName()`. None of the blog's methods exist.

- **Line 91**: Claims field types: `StringField`, `TextField`, `IntegerField`, `BooleanField`, `DateTimeField`, `EntityReferenceField`, `FileField`. Actual field item classes: `StringItem`, `TextItem`, `IntegerItem`, `BooleanItem`, `FloatItem`, `EntityReferenceItem`. No `DateTimeField`, no `FileField`. They're `*Item` classes, not `*Field` classes.

- **Line 96-107**: The `Teaching` entity example shows it using `buildFields()` with `$this->fields->add(new StringField('title'))` etc. Actual `Teaching` class (`/home/jones/dev/minoo/src/Entity/Teaching.php`) has no `buildFields()` method and no field objects. It extends `ContentEntityBase` and works with a `$values` array and `$entityKeys`. It sets default values for `status`, `created_at`, `updated_at`, `copyright_status` in its constructor.

- **Line 114-122**: `EntityFactory` shown with methods `create(string $entityType, ?EntityId $id = null): EntityInterface`, `fromArray()`, `fromStorage()`. Actual `EntityFactory` is in `Waaseyaa\Testing\Factory` (a test utility, not a core framework class) with signature `create(string $entityTypeId, array $overrides = []): array` — it returns an array of values, not an `EntityInterface`. No `fromArray()` or `fromStorage()` methods exist.

---

## waaseyaa-access-control — 8 issues found

- **Line 31-35**: `AccessPolicyInterface` shown with:
  ```php
  public function applies(EntityInterface $entity, string $operation, ?UserInterface $user): bool;
  public function grants(EntityInterface $entity, string $operation, ?UserInterface $user): AccessResult;
  ```
  **Actual** interface has completely different methods:
  ```php
  public function access(EntityInterface $entity, string $operation, AccountInterface $account): AccessResult;
  public function createAccess(string $entityTypeId, string $bundle, AccountInterface $account): AccessResult;
  public function appliesTo(string $entityTypeId): bool;
  ```
  Issues:
  - `applies()` does not exist. Actual: `appliesTo(string $entityTypeId): bool` — takes only entity type ID, not the full entity + operation + user
  - `grants()` does not exist. Actual: `access()` — same signature concept but different name
  - `?UserInterface` does not exist. Actual: `AccountInterface $account` (not nullable)
  - Missing `createAccess()` method entirely

- **Line 38**: Claims `AccessResult::allow()`, `AccessResult::deny()`, `AccessResult::neutral()`. Actual static constructors: `AccessResult::allowed()`, `AccessResult::forbidden()`, `AccessResult::neutral()`. Two of three are wrong: `allow()` should be `allowed()`, `deny()` should be `forbidden()`.

- **Line 55-59**: `FieldAccessPolicyInterface` shown with:
  ```php
  public function appliesToField(FieldInterface $field, string $operation, ?UserInterface $user): bool;
  public function grantsField(FieldInterface $field, string $operation, ?UserInterface $user): AccessResult;
  ```
  **Actual** interface:
  ```php
  public function fieldAccess(
      EntityInterface $entity,
      string $fieldName,
      string $operation,
      AccountInterface $account,
  ): AccessResult;
  ```
  Issues:
  - `appliesToField()` does not exist
  - `grantsField()` does not exist
  - Only one method: `fieldAccess()`
  - Takes `EntityInterface $entity` + `string $fieldName`, not `FieldInterface $field`
  - Uses `AccountInterface $account`, not `?UserInterface $user`

- **Line 71-90**: `IndigenousContentPolicy` class shown. No such class exists in the codebase. The actual teaching access policy is `TeachingAccessPolicy` in `/home/jones/dev/minoo/src/Access/TeachingAccessPolicy.php`, which uses `appliesTo()` pattern with `#[PolicyAttribute]` attribute, not the `applies()`/`grants()` pattern shown.

- **Line 75**: Shows `$entity->getField('is_public')?->getValue()`. Actual code uses `$entity->get('status')`, not `getField()` or `is_public`. The `TeachingAccessPolicy` checks publication status, not an `is_public` field.

- **Line 81**: Shows `AccessResult::deny('...')`. Actual: `AccessResult::forbidden('...')` or `AccessResult::neutral('...')`.

- **Line 88**: Shows `AccessResult::allow()`. Actual: `AccessResult::allowed()`.

- **Line 114**: Claims "anonymous users are represented as `null`, not a guest user object." Actual `AccessPolicyInterface` takes `AccountInterface $account` (non-nullable). Anonymous handling is via `AccountInterface::isAuthenticated()`.

---

## waaseyaa-api-layer — 9 issues found

- **Line 32-38**: `ResourceSerializer` shown with:
  ```php
  public function serialize(EntityInterface $entity, RequestContext $context): array;
  public function serializeCollection(iterable $entities, RequestContext $context): array;
  public function deserialize(array $document, string $entityType): EntityInterface;
  ```
  **Actual** signatures:
  ```php
  public function serialize(
      EntityInterface $entity,
      ?EntityAccessHandler $accessHandler = null,
      ?AccountInterface $account = null,
  ): JsonApiResource;

  public function serializeCollection(
      array $entities,
      ?EntityAccessHandler $accessHandler = null,
      ?AccountInterface $account = null,
  ): array;
  ```
  Issues:
  - `RequestContext` does not exist. Actual: separate `?EntityAccessHandler` and `?AccountInterface` parameters
  - `serialize()` returns `JsonApiResource`, not `array`
  - `deserialize()` does not exist at all (confirmed by grep)
  - `serializeCollection()` takes `array`, not `iterable`

- **Line 68**: Claims "The `RequestContext` carries the access control context." `RequestContext` does not exist. Access context is passed as separate `EntityAccessHandler` and `AccountInterface` parameters.

- **Line 74-79**: `SchemaPresenter` shown with:
  ```php
  public function present(string $entityType): array;
  public function presentField(FieldInterface $field): array;
  ```
  **Actual**:
  ```php
  public function present(
      EntityTypeInterface $entityType,
      array $fieldDefinitions = [],
      ?EntityInterface $entity = null,
      ?EntityAccessHandler $accessHandler = null,
      ?AccountInterface $account = null,
  ): array;
  ```
  Issues:
  - `present()` takes `EntityTypeInterface`, not `string`
  - `present()` has 5 parameters, not 1
  - `presentField()` does not exist as a public method

- **Line 103-128**: `TeachingController` shown extending `AbstractApiController` with injected `EntityRepository`, `ResourceSerializer`, `PolicyEvaluator`. **Actual** `TeachingController`:
  - Does NOT extend `AbstractApiController` (no such class found)
  - Constructor takes `EntityTypeManager` and `Environment` (Twig), not the three services shown
  - `show()` method signature takes `array $params, array $query, AccountInterface $account, HttpRequest $request` and returns `SsrResponse`, not `JsonResponse`
  - No `EntityRepository` — uses `$this->entityTypeManager->getStorage('teaching')`
  - No `PolicyEvaluator` — access control is done via `condition('status', 1)` in storage queries
  - No `RequestContext::fromRequest()` — this class doesn't exist
  - No `EntityId::from($id)` — `EntityId` doesn't exist
  - Returns Twig-rendered HTML via `SsrResponse`, not JSON

- **Line 139**: Claims `filter=title:Water` syntax. This is a specific claim about query parsing that may or may not match. The actual filtering uses `condition()` calls on storage queries, not URL-based filtering.

---

## waaseyaa-ai-packages — 5 issues found

- **Line 43-47**: `AgentInterface` shown with:
  ```php
  public function getCapabilities(): CapabilitySet;
  public function execute(AgentAction $action, AgentContext $context): AgentResult;
  ```
  **Actual**:
  ```php
  public function execute(AgentContext $context): AgentResult;
  public function dryRun(AgentContext $context): AgentResult;
  public function describe(): string;
  ```
  Issues:
  - `getCapabilities(): CapabilitySet` does not exist. Actual: `describe(): string`
  - `execute()` takes only `AgentContext $context`, not `AgentAction $action, AgentContext $context`
  - Missing `dryRun()` method not mentioned in blog

- **Line 77-82**: `VectorStoreInterface` shown with:
  ```php
  public function store(EntityInterface $entity, array $embedding): void;
  public function search(array $queryEmbedding, SearchOptions $options): VectorSearchResult;
  public function delete(EntityId $id): void;
  ```
  **Actual**:
  ```php
  public function store(EntityEmbedding $embedding): void;
  public function search(array $queryVector, int $limit = 10, ?string $entityTypeId = null, ?string $langcode = null, array $fallbackLangcodes = []): array;
  public function delete(string $entityTypeId, int|string $entityId): void;
  ```
  Issues:
  - `store()` takes `EntityEmbedding`, not `EntityInterface $entity, array $embedding`
  - `search()` takes explicit parameters, not `SearchOptions $options`; returns `SimilarityResult[]` not `VectorSearchResult`
  - `delete()` takes `string $entityTypeId, int|string $entityId`, not `EntityId $id`
  - Additional methods `get()` and `has()` exist but are not mentioned

---

## waaseyaa-packagist — 4 issues found

- **Line 87-95**: GitHub Actions workflow shown using `symplify/monorepo-split-github-action@v2`. **Actual** workflow installs `splitsh-lite` directly via curl and runs it manually — it does NOT use the Symplify action. The actual workflow uses:
  ```yaml
  - name: Install splitsh-lite
    run: |
      curl -sL https://github.com/splitsh/lite/releases/download/v1.0.1/lite_linux_amd64.tar.gz | tar xz
      sudo mv splitsh-lite /usr/local/bin/splitsh-lite
  ```

- **Line 88-92**: The workflow matrix format shown uses `{ name: 'entity', directory: 'packages/entity' }`. Actual matrix uses `{ local: 'packages/entity', remote: 'entity' }` — different key names (`local`/`remote` vs `name`/`directory`).

- **Line 110-115**: Shows subpackage version constraints as `"waaseyaa/contracts": "^1.1"`, `"waaseyaa/types": "^1.1"`. There are no packages named `waaseyaa/contracts` or `waaseyaa/types`. The actual dependencies use `^0.1` constraints (e.g., `"waaseyaa/typed-data": "^0.1"`). Version is 0.1, not 1.1.

- **Line 131-133**: Shows example `composer.json` with `"license": "MIT"`. Actual license across all packages is `"GPL-2.0-or-later"`, not MIT.

---

## co-development-skill-set — 1 issue found

- **Line 20**: References "Claudriel (AI personal operations)" at `https://github.com/jonesrussell/claudriel`. Claudriel exists at `/home/jones/dev/claudriel/` and has PHP source files, confirming it's real. The description as "AI personal operations" and it being a Waaseyaa application is consistent with the codebase structure.

- No major code inaccuracies found in this post. It describes workflow patterns and skill designs rather than specific interface signatures. The claims about symlinks, skill structure, and audit reports are design descriptions, not code-level claims that can be verified against source.

---

## Summary

| Post | Issues |
|------|--------|
| waaseyaa-intro | 2 |
| waaseyaa-entity-system | 12 |
| waaseyaa-access-control | 8 |
| waaseyaa-api-layer | 9 |
| waaseyaa-ai-packages | 5 |
| waaseyaa-packagist | 4 |
| co-development-skill-set | 0 |
| **Total** | **40** |

The most pervasive problem: the blog posts present idealized/simplified interfaces that don't match the actual implementations. Every interface code block in the entity-system, access-control, api-layer, and ai-packages posts contains method signatures that differ from reality. The most common categories of error:

1. **Fabricated classes**: `EntityId`, `FieldCollection`, `FieldInterface` (as shown), `RequestContext`, `PolicyEvaluator`, `AbstractApiController`, `SearchOptions`, `VectorSearchResult`, `CapabilitySet`, `AgentAction` — none exist
2. **Wrong method names**: `getId()` vs `id()`, `applies()`/`grants()` vs `appliesTo()`/`access()`, `allow()`/`deny()` vs `allowed()`/`forbidden()`
3. **Wrong parameter types**: `?UserInterface` vs `AccountInterface`, `EntityId` vs `int|string|null`
4. **Wrong return types**: `array` vs `JsonApiResource`, `FieldInterface` vs `mixed`
5. **Wrong license**: MIT vs GPL-2.0-or-later
6. **Wrong version ranges**: `^1.1` vs `^0.1`
